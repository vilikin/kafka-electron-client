package `in`.vilik

data class KafkaTopic(
    val id: String,
    val isInternal: Boolean
)

data class KafkaConsumerGroup(
    val id: String
)

sealed class MessageFromServer(
    val type: Type
) {
    enum class Type {
        STATUS_CONNECTED,
        STATUS_CONNECTING,
        STATUS_DISCONNECTED,
        REFRESH_TOPICS,
        REFRESH_CONSUMER_GROUPS
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
