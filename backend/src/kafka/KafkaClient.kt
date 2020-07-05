package `in`.vilik.kafka

import `in`.vilik.model.*
import com.google.gson.Gson
import io.ktor.http.cio.websocket.Frame
import io.ktor.http.cio.websocket.WebSocketSession
import kotlinx.coroutines.*
import org.apache.kafka.clients.admin.AdminClient
import org.apache.kafka.clients.admin.KafkaAdminClient
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.clients.producer.KafkaProducer
import java.time.Duration
import java.util.*
import kotlin.concurrent.fixedRateTimer

sealed class KafkaClientState

data class KafkaClientStateConnected(
  val environmentId: String,
  val recordPollingJob: Job,
  val refreshTopicsTimer: Timer,
  val refreshConsumerGroupsAndTopicOffsetsTimer: Timer,
  val consumer: KafkaConsumer<String, String>,
  val producer: KafkaProducer<String, String>,
  val adminClient: AdminClient,
  val subscribedToOffsetsOfConsumerGroups: MutableSet<String>,
  val subscribedToOffsetsOfTopics: MutableSet<String>
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
    if (sessions.isEmpty()) {
      disconnect(DisconnectReason.ALL_WEBSOCKET_SESSIONS_CLOSED)
    }
  }

  private fun broadcast(message: MessageFromServer) {
    val json: String = Gson().toJson(message)
    println("Broadcasting: $json")
    sessions.forEach {
      runBlocking {
        it.send(Frame.Text(json))
        // Dirty hack: Give frame some time to actually get sent, flushing did not work
        delay(50)
      }
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
        producer = KafkaProducer(producerProps)
        consumer = KafkaConsumer(consumerProps)
        adminClient = KafkaAdminClient.create(adminClientProps)

        // Try an operation to see if connection works
        adminClient.listTopics().names().get()

        val refreshTopicsTimer = fixedRateTimer(initialDelay = 500, period = 60_000) {
          refreshTopics()
        }

        val refreshConsumerGroupsAndTopicOffsetsTimer = fixedRateTimer(initialDelay = 500, period = 5_000) {
          refreshConsumerGroupsAndTopicOffsets()
        }

        val job = createRecordPollingJob()

        state = KafkaClientStateConnected(
          environmentId,
          job,
          refreshTopicsTimer,
          refreshConsumerGroupsAndTopicOffsetsTimer,
          consumer,
          producer,
          adminClient,
          mutableSetOf(
            consumerProps[ConsumerConfig.GROUP_ID_CONFIG]
              ?: error("Group id should be defined as a prop")
          ),
          mutableSetOf()
        )

        broadcast(StatusConnected(environmentId))
      } catch (e: Exception) {
        e.printStackTrace()
        producer?.close()
        consumer?.close()
        adminClient?.close()
        state = KafkaClientStateDisconnected()
        broadcast(StatusFailedToConnect(environmentId, e.message ?: e.javaClass.name))
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
      refreshConsumerGroupsAndTopicOffsets()
    }
  }

  fun unsubscribeFromOffsetsOfConsumerGroup(groupId: String) {
    (state as? KafkaClientStateConnected)?.let { connectedState ->
      connectedState.subscribedToOffsetsOfConsumerGroups.remove(groupId)
      broadcast(UnsubscribedFromOffsetsOfConsumerGroup(groupId))
    }
  }

  fun subscribeToOffsetsOfTopic(topic: String) {
    (state as? KafkaClientStateConnected)?.let { connectedState ->
      connectedState.subscribedToOffsetsOfTopics.add(topic)
      broadcast(SubscribedToOffsetsOfTopic(topic))
      refreshConsumerGroupsAndTopicOffsets()
    }
  }

  fun unsubscribeFromOffsetsOfTopic(topic: String) {
    (state as? KafkaClientStateConnected)?.let { connectedState ->
      connectedState.subscribedToOffsetsOfTopics.remove(topic)
      broadcast(UnsubscribedFromOffsetsOfTopic(topic))
    }
  }

  private fun refreshTopics() {
    (state as? KafkaClientStateConnected)?.let { connectedState ->
      try {
        val topics = getTopics(connectedState.adminClient)
        broadcast(RefreshTopics(topics))
      } catch (e: Exception) {
        println("Failed to refresh topics")
        e.printStackTrace()
      }
    }
  }

  private fun refreshConsumerGroupsAndTopicOffsets() {
    (state as? KafkaClientStateConnected)?.let { connectedState ->
      try {
        val consumerGroups = getAllConsumerGroups(
          connectedState.adminClient,
          connectedState.subscribedToOffsetsOfConsumerGroups
        )

        val fetchOffsetsForTopics = consumerGroups.flatMap {
          it.offsets.map(ConsumerGroupOffsetForPartition::topic)
        }.toSet() + connectedState.subscribedToOffsetsOfTopics

        val topicOffsets = getTopicOffsets(
          connectedState.adminClient,
          fetchOffsetsForTopics
        )

        broadcast(RefreshConsumerGroups(consumerGroups))
        broadcast(RefreshTopicOffsets(topicOffsets))
      } catch (e: Exception) {
        println("Failed to refresh consumer groups & topic offsets")
        e.printStackTrace()
      }
    }
  }

  fun disconnect(reason: DisconnectReason) {
    (state as? KafkaClientStateConnected)?.let { connectedState ->
      connectedState.refreshTopicsTimer.cancel()
      connectedState.refreshConsumerGroupsAndTopicOffsetsTimer.cancel()
      connectedState.recordPollingJob.cancel()

      synchronized(connectedState.consumer) {
        connectedState.consumer.close()
      }

      connectedState.producer.close()
      connectedState.adminClient.close()

      state = KafkaClientStateDisconnected()
      broadcast(StatusDisconnected(connectedState.environmentId, reason))
    }
  }
}
