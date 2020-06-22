package `in`.vilik

data class KafkaTopicPartition(
    val id: Int,
    val replicas: List<Int>,
    val inSyncReplicas: List<Int>,
    val leader: Int
)

data class KafkaTopic(
    val id: String,
    val isInternal: Boolean,
    val partitions: List<KafkaTopicPartition>
)

data class TopicPartitionOffsets(
    val topic: String,
    val partition: Int,
    val offset: Long
)

data class KafkaConsumerGroup(
    val id: String,
    val offsets: List<TopicPartitionOffsets>
)

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
        RECEIVE_RECORDS,
        SUBSCRIBED_TO_RECORDS_OF_TOPIC,
        UNSUBSCRIBED_FROM_RECORDS_OF_TOPIC,
        SUBSCRIBED_TO_OFFSETS_OF_CONSUMER_GROUP,
        UNSUBSCRIBED_FROM_OFFSETS_OF_CONSUMER_GROUP
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
    val topics: List<KafkaTopic>
) : MessageFromServer(Type.REFRESH_TOPICS)

class RefreshConsumerGroups(
    val consumerGroups: List<KafkaConsumerGroup>
) : MessageFromServer(Type.REFRESH_CONSUMER_GROUPS)

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
