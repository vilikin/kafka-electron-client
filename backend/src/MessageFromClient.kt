package `in`.vilik

import com.google.gson.GsonBuilder
import com.google.gson.typeadapters.RuntimeTypeAdapterFactory

enum class AuthenticationStrategy {
    SASL_PLAIN,
    NONE
}

sealed class MessageFromClient(
        val type: Type
) {
    enum class Type {
        REQUEST_CONNECT,
        REQUEST_DISCONNECT,
        SUBSCRIBE_TO_RECORDS_OF_TOPIC,
        UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC,
        SUBSCRIBE_TO_OFFSETS_OF_TOPIC,
        UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC
    }

    companion object {
        fun parse(string: String): MessageFromClient {
            val runtimeTypeAdapterFactory = RuntimeTypeAdapterFactory
                    .of(MessageFromClient::class.java, "type")
                    .registerSubtype(RequestConnect::class.java, Type.REQUEST_CONNECT.name)
                    .registerSubtype(RequestDisconnect::class.java, Type.REQUEST_DISCONNECT.name)
                    .registerSubtype(SubscribeToRecordsOfTopic::class.java, Type.SUBSCRIBE_TO_RECORDS_OF_TOPIC.name)
                    .registerSubtype(UnsubscribeFromRecordsOfTopic::class.java, Type.UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC.name)
                    .registerSubtype(SubscribeToOffsetsOfTopic::class.java, Type.SUBSCRIBE_TO_OFFSETS_OF_TOPIC.name)
                    .registerSubtype(UnsubscribeFromOffsetsOfTopic::class.java, Type.UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC.name)

            return GsonBuilder()
                    .registerTypeAdapterFactory(runtimeTypeAdapterFactory)
                    .create()
                    .fromJson(string, MessageFromClient::class.java)
        }
    }
}

class RequestConnect(
        val environmentId: String,
        val brokers: List<String>,
        val authenticationStrategy: AuthenticationStrategy,
        val username: String?,
        val password: String?
): MessageFromClient(Type.REQUEST_CONNECT)

class RequestDisconnect: MessageFromClient(Type.REQUEST_DISCONNECT)

class SubscribeToRecordsOfTopic(
    val topic: String
): MessageFromClient(Type.SUBSCRIBE_TO_RECORDS_OF_TOPIC)

class UnsubscribeFromRecordsOfTopic(
    val topic: String
): MessageFromClient(Type.UNSUBSCRIBE_FROM_RECORDS_OF_TOPIC)

class SubscribeToOffsetsOfTopic(
    val topic: String
): MessageFromClient(Type.SUBSCRIBE_TO_OFFSETS_OF_TOPIC)

class UnsubscribeFromOffsetsOfTopic(
    val topic: String
): MessageFromClient(Type.UNSUBSCRIBE_FROM_OFFSETS_OF_TOPIC)
