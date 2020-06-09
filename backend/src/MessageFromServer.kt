package `in`.vilik

sealed class MessageFromServer(
        val type: Type
) {
    enum class Type {
        STATUS_CONNECTED,
        STATUS_CONNECTING,
        STATUS_DISCONNECTED
    }
}

class StatusConnected(
        val environmentId: String
): MessageFromServer(Type.STATUS_CONNECTED)

class StatusConnecting(
        val environmentId: String
): MessageFromServer(Type.STATUS_CONNECTING)

class StatusDisconnected(
        val reason: String
): MessageFromServer(Type.STATUS_DISCONNECTED)
