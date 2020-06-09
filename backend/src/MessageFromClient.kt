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
        CONNECT,
        DISCONNECT
    }

    companion object {
        fun parse(string: String): MessageFromClient {
            val runtimeTypeAdapterFactory = RuntimeTypeAdapterFactory
                    .of(MessageFromClient::class.java, "type")
                    .registerSubtype(Connect::class.java, Type.CONNECT.name)
                    .registerSubtype(Disconnect::class.java, Type.DISCONNECT.name)

            return GsonBuilder()
                    .registerTypeAdapterFactory(runtimeTypeAdapterFactory)
                    .create()
                    .fromJson(string, MessageFromClient::class.java)
        }
    }
}

class Connect(
        val environmentId: String,
        val brokers: List<String>,
        val authenticationStrategy: AuthenticationStrategy,
        val username: String?,
        val password: String?
): MessageFromClient(Type.CONNECT)

class Disconnect: MessageFromClient(Type.DISCONNECT)
