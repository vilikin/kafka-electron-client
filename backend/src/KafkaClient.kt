package `in`.vilik

import com.google.gson.Gson
import io.ktor.http.cio.websocket.Frame
import io.ktor.http.cio.websocket.WebSocketSession
import org.apache.kafka.clients.admin.AdminClient
import org.apache.kafka.clients.admin.AdminClientConfig
import org.apache.kafka.clients.admin.KafkaAdminClient
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.kafka.common.serialization.StringSerializer

sealed class KafkaClientState

data class KafkaClientStateConnected(
    val environmentId: String,
    val consumer: KafkaConsumer<String, String>,
    val producer: KafkaProducer<String, String>,
    val adminClient: AdminClient
) : KafkaClientState()

data class KafkaClientStateConnecting(val environmentId: String) : KafkaClientState()

class KafkaClientStateDisconnected : KafkaClientState()

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
    }

    private suspend fun broadcast(message: MessageFromServer) {
        val json: String = Gson().toJson(message)
        println("Broadcasting: $json")
        sessions.forEach {
            it.send(Frame.Text(json))
        }
    }

    suspend fun connect(
        environmentId: String,
        brokers: List<String>,
        authenticationStrategy: AuthenticationStrategy,
        username: String?,
        password: String?
    ) {
        if (state is KafkaClientStateDisconnected) {
            state = KafkaClientStateConnecting(environmentId)
            broadcast(StatusConnecting(environmentId))

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
                return authProps;
            }

            val producerProps = combineWithAuthProps(
                mutableMapOf(
                    ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG to StringSerializer::class.java.name,
                    ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG to StringSerializer::class.java.name,
                    ProducerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
                    ProducerConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId"
                )
            )

            val consumerProps = combineWithAuthProps(
                mutableMapOf(
                    ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
                    ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
                    ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
                    ConsumerConfig.GROUP_ID_CONFIG to "kafka-ui-client-$environmentId",
                    ConsumerConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId"
                )
            )

            val adminClientProps = combineWithAuthProps(
                mutableMapOf(
                    AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
                    AdminClientConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId"
                )
            )

            var producer: KafkaProducer<String, String>? = null
            var consumer: KafkaConsumer<String, String>? = null
            var adminClient: AdminClient? = null

            try {
                producer = KafkaProducer<String, String>(producerProps)
                consumer = KafkaConsumer<String, String>(consumerProps)
                adminClient = KafkaAdminClient.create(adminClientProps)

                state = KafkaClientStateConnected(
                    environmentId,
                    consumer,
                    producer,
                    adminClient
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

    suspend fun disconnect() {
        if (state is KafkaClientStateConnected) {
            (state as? KafkaClientStateConnected)?.consumer?.close()
            (state as? KafkaClientStateConnected)?.producer?.close()
            (state as? KafkaClientStateConnected)?.adminClient?.close()

            state = KafkaClientStateDisconnected()
            broadcast(StatusDisconnected("Disconnect requested by client"))
        }
    }
}
