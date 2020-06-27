package `in`.vilik.model

import `in`.vilik.kafka.ConsumerGroup
import `in`.vilik.kafka.Topic
import `in`.vilik.kafka.PartitionOffsets


data class KafkaRecord(
  val topic: String,
  val partition: Int,
  val offset: Long,
  val timestamp: Long,
  val key: String?,
  val value: String
)

sealed class MessageFromServer(
  val type: Type
) {
  enum class Type {
    STATUS_CONNECTED,
    STATUS_CONNECTING,
    STATUS_DISCONNECTED,
    REFRESH_TOPICS,
    REFRESH_CONSUMER_GROUPS,
    REFRESH_TOPIC_OFFSETS,
    RECEIVE_RECORDS,
    SUBSCRIBED_TO_RECORDS_OF_TOPIC,
    UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC,
    SUBSCRIBED_TO_OFFSETS_OF_CONSUMER_GROUP,
    UNSUBSCRIBED_FROM_OFFSETS_OF_CONSUMER_GROUP,
    SUBSCRIBED_TO_OFFSETS_OF_TOPIC,
    UNSUBSCRIBED_FROM_OFFSETS_OF_TOPIC
  }
}

class StatusConnected(
  val environmentId: String
) : MessageFromServer(Type.STATUS_CONNECTED)

class StatusConnecting(
  val environmentId: String
) : MessageFromServer(Type.STATUS_CONNECTING)

class StatusDisconnected(
  val reason: String
) : MessageFromServer(Type.STATUS_DISCONNECTED)

class RefreshTopics(
  val topics: List<Topic>
) : MessageFromServer(Type.REFRESH_TOPICS)

class RefreshConsumerGroups(
  val consumerGroups: List<ConsumerGroup>
) : MessageFromServer(Type.REFRESH_CONSUMER_GROUPS)

class RefreshTopicOffsets(
  val offsets: List<PartitionOffsets>
) : MessageFromServer(Type.REFRESH_TOPIC_OFFSETS)

class SubscribedToRecordsOfTopic(
  val topic: String
) : MessageFromServer(Type.SUBSCRIBED_TO_RECORDS_OF_TOPIC)

class UnsubscribedFromRecordsOfTopic(
  val topic: String
) : MessageFromServer(Type.UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC)

class ReceiveRecords(
  val records: List<KafkaRecord>
) : MessageFromServer(Type.RECEIVE_RECORDS)

class SubscribedToOffsetsOfConsumerGroup(
  val groupId: String
) : MessageFromServer(Type.SUBSCRIBED_TO_OFFSETS_OF_CONSUMER_GROUP)

class UnsubscribedFromOffsetsOfConsumerGroup(
  val groupId: String
) : MessageFromServer(Type.UNSUBSCRIBED_FROM_OFFSETS_OF_CONSUMER_GROUP)

class SubscribedToOffsetsOfTopic(
  val topic: String
) : MessageFromServer(Type.SUBSCRIBED_TO_OFFSETS_OF_TOPIC)

class UnsubscribedFromOffsetsOfTopic(
  val topic: String
) : MessageFromServer(Type.UNSUBSCRIBED_FROM_OFFSETS_OF_TOPIC)
