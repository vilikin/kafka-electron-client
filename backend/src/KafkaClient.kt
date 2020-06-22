package `in`.vilik

import com.google.gson.Gson
import io.ktor.http.cio.websocket.Frame
import io.ktor.http.cio.websocket.WebSocketSession
import kotlinx.coroutines.*
import org.apache.kafka.clients.admin.*
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.common.Node
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.kafka.common.serialization.StringSerializer
import java.time.Duration
import java.util.*
import kotlin.concurrent.fixedRateTimer
import kotlin.system.measureTimeMillis

sealed class KafkaClientState

data class KafkaClientStateConnected(
    val environmentId: String,
    val recordPollingJob: Job,
    val refreshTopicsTimer: Timer,
    val refreshConsumerGroupsTimer: Timer,
    val consumer: KafkaConsumer<String, String>,
    val producer: KafkaProducer<String, String>,
    val adminClient: AdminClient,
    val subscribedToOffsetsOfConsumerGroups: MutableSet<String>
) : KafkaClientState()

data class KafkaClientStateConnecting(val environmentId: String) : KafkaClientState()

class KafkaClientStateDisconnected : KafkaClientState()

data class KafkaProps(
    val producerProps: Map<String, String>,
    val consumerProps: Map<String, String>,
    val adminClientProps: Map<String, String>
)

class KafkaClient {
    private var state: KafkaClientState = KafkaClientStateDisconnected()
    private val sessions: MutableList<WebSocketSession> = mutableListOf()

    fun addSession(session: WebSocketSession) {
        println("Adding session")
        sessions.add(session)
    }

    fun removeSession(session: WebSocketSession) {
        println("Removing session")
        sessions.removeIf { it === session }
        if (sessions.isEmpty()) {
            disconnect()
        }
    }

    private fun broadcast(message: MessageFromServer) {
        val json: String = Gson().toJson(message)
        println("Broadcasting: $json")
        sessions.forEach {
            runBlocking { it.send(Frame.Text(json)) }
        }
    }

    fun connect(
        environmentId: String,
        brokers: List<String>,
        authenticationStrategy: AuthenticationStrategy,
        username: String?,
        password: String?
    ) {
        if (state is KafkaClientStateDisconnected) {
            state = KafkaClientStateConnecting(environmentId)
            broadcast(StatusConnecting(environmentId))

            val (producerProps, consumerProps, adminClientProps) = getKafkaProps(
                environmentId,
                brokers,
                authenticationStrategy,
                username,
                password
            )

            var producer: KafkaProducer<String, String>? = null
            var consumer: KafkaConsumer<String, String>? = null
            var adminClient: AdminClient? = null

            try {
                producer = KafkaProducer<String, String>(producerProps)
                consumer = KafkaConsumer<String, String>(consumerProps)
                adminClient = KafkaAdminClient.create(adminClientProps)

                // Try an operation to see if connection works
                adminClient.listTopics().names().get()

                val refreshTopicsTimer = fixedRateTimer(initialDelay = 500, period = 60_000) {
                    runBlocking {
                        refreshTopics()
                    }
                }

                val refreshConsumerGroupsTimer = fixedRateTimer(initialDelay = 500, period = 5_000) {
                    runBlocking {
                        refreshConsumerGroups()
                    }
                }

                val job = createRecordPollingJob()

                state = KafkaClientStateConnected(
                    environmentId,
                    job,
                    refreshTopicsTimer,
                    refreshConsumerGroupsTimer,
                    consumer,
                    producer,
                    adminClient,
                    mutableSetOf(
                        consumerProps[ConsumerConfig.GROUP_ID_CONFIG] ?: error("Group id should be defined as a prop")
                    )
                )

                broadcast(StatusConnected(environmentId))
            } catch (e: Exception) {
                e.printStackTrace()
                producer?.close()
                consumer?.close()
                adminClient?.close()
                state = KafkaClientStateDisconnected()
                broadcast(StatusDisconnected(e.message ?: "Exception"))
            }
        } else {
            throw Exception("Already connected/connecting")
        }
    }

    private fun createRecordPollingJob(): Job {
        return GlobalScope.launch {
            while (true) {
                (state as? KafkaClientStateConnected)?.let { connectedState ->
                    synchronized(connectedState.consumer) {
                        if (connectedState.consumer.subscription().isNotEmpty()) {
                            val records = connectedState.consumer.poll(Duration.ofMillis(500))
                                .map {
                                    KafkaRecord(
                                        it.topic(),
                                        it.partition(),
                                        it.offset(),
                                        it.timestamp(),
                                        it.key(),
                                        it.value()
                                    )
                                }

                            if (records.isNotEmpty()) {
                                connectedState.consumer.commitAsync()
                                broadcast(ReceiveRecords(records))
                            }
                        }
                    }
                }

                delay(500)
            }
        }
    }

    fun subscribeToRecordsOfTopic(topic: String) {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            synchronized(connectedState.consumer) {
                if (!connectedState.consumer.subscription().contains(topic)) {
                    val topicsToSubscribe = connectedState.consumer.subscription() + topic
                    connectedState.consumer.unsubscribe()
                    connectedState.consumer.subscribe(topicsToSubscribe)
                    broadcast(SubscribedToRecordsOfTopic(topic))
                }
            }
        }
    }

    fun unsubscribeFromRecordsOfTopic(topic: String) {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            synchronized(connectedState.consumer) {
                if (connectedState.consumer.subscription().contains(topic)) {
                    val newTopics = connectedState.consumer.subscription() - topic
                    connectedState.consumer.unsubscribe()
                    connectedState.consumer.subscribe(newTopics)
                    broadcast(UnsubscribedFromRecordsOfTopic(topic))
                }
            }
        }
    }

    fun subscribeToOffsetsOfConsumerGroup(groupId: String) {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            connectedState.subscribedToOffsetsOfConsumerGroups.add(groupId)
            broadcast(SubscribedToOffsetsOfConsumerGroup(groupId))
        }
    }

    fun unsubscribeFromOffsetsOfConsumerGroup(groupId: String) {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            connectedState.subscribedToOffsetsOfConsumerGroups.remove(groupId)
            broadcast(UnsubscribedFromOffsetsOfConsumerGroup(groupId))
        }
    }

    private fun refreshTopics() {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            try {
                val topics = connectedState.adminClient.listTopics().listings().get()
                val topicDescriptions =
                    connectedState.adminClient.describeTopics(topics.map(TopicListing::name)).all().get()

                val results = topics.map {
                    val description = topicDescriptions[it.name()]!!
                    synchronized(connectedState.consumer) {
                        KafkaTopic(
                            description.name(),
                            description.isInternal,
                            description.partitions().map { partition ->
                                KafkaTopicPartition(
                                    partition.partition(),
                                    partition.replicas().map(Node::id),
                                    partition.isr().map(Node::id),
                                    partition.leader().id()
                                )
                            }
                        )
                    }
                }

                broadcast(RefreshTopics(results))
            } catch (e: Exception) {
                println("Failed to refresh topics")
                e.printStackTrace()
            }
        }
    }

    private fun refreshConsumerGroups() {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            try {
                val consumerGroups = connectedState.adminClient.listConsumerGroups().all().get()
                    .map {
                        val groupId = it.groupId()
                        if (connectedState.subscribedToOffsetsOfConsumerGroups.contains(groupId)) {
                            val offsets = connectedState.adminClient.listConsumerGroupOffsets(groupId)
                                .partitionsToOffsetAndMetadata().get()
                                .map { (key, value) ->
                                    TopicPartitionOffsets(
                                        key.topic(),
                                        key.partition(),
                                        value.offset()
                                    )
                                }

                            KafkaConsumerGroup(groupId, offsets)
                        } else {
                            KafkaConsumerGroup(groupId, emptyList())
                        }
                    }

                broadcast(RefreshConsumerGroups(consumerGroups))
            } catch (e: Exception) {
                println("Failed to refresh consumer groups")
                e.printStackTrace()
            }
        }
    }

    fun disconnect() {
        (state as? KafkaClientStateConnected)?.let { connectedState ->
            connectedState.refreshTopicsTimer.cancel()
            connectedState.refreshConsumerGroupsTimer.cancel()
            connectedState.recordPollingJob.cancel()

            synchronized(connectedState.consumer) {
                connectedState.consumer.close()
            }

            connectedState.producer.close()
            connectedState.adminClient.close()

            state = KafkaClientStateDisconnected()
            broadcast(StatusDisconnected("Disconnect requested by client"))
        }
    }

    private fun getKafkaProps(
        environmentId: String,
        brokers: List<String>,
        authenticationStrategy: AuthenticationStrategy,
        username: String?,
        password: String?
    ): KafkaProps {
        fun combineWithAuthProps(map: Map<String, String>): Map<String, String> {
            val authProps = if (authenticationStrategy == AuthenticationStrategy.SASL_PLAIN)
                mutableMapOf(
                    "security.protocol" to "SASL_SSL",
                    "sasl.mechanism" to "PLAIN",
                    "sasl.jaas.config" to ("org.apache.kafka.common.security.plain.PlainLoginModule required username=\""
                        + username
                        + "\" password=\""
                        + password
                        + "\";")
                ) else mutableMapOf()

            authProps.putAll(map)
            return authProps
        }

        val producerProps = combineWithAuthProps(
            mutableMapOf(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG to StringSerializer::class.java.name,
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG to StringSerializer::class.java.name,
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
                ProducerConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId",
                ProducerConfig.RETRIES_CONFIG to "5",
                ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG to "5000"
            )
        )

        val consumerProps = combineWithAuthProps(
            mutableMapOf(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
                ConsumerConfig.GROUP_ID_CONFIG to "kafka-ui-group-$environmentId",
                ConsumerConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId",
                ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG to "false"
            )
        )

        val adminClientProps = combineWithAuthProps(
            mutableMapOf(
                AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
                AdminClientConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId",
                AdminClientConfig.RETRIES_CONFIG to "5",
                AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG to "5000",
                AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG to "5000"
            )
        )

        return KafkaProps(
            producerProps,
            consumerProps,
            adminClientProps
        )
    }
}
