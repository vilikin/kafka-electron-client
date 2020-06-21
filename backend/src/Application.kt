package `in`.vilik

import io.ktor.application.Application
import io.ktor.application.install
import io.ktor.features.CORS
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.cio.websocket.Frame
import io.ktor.http.cio.websocket.pingPeriod
import io.ktor.http.cio.websocket.readText
import io.ktor.http.cio.websocket.timeout
import io.ktor.routing.routing
import io.ktor.websocket.WebSockets
import io.ktor.websocket.webSocket
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.consumeEach
import kotlinx.coroutines.runBlocking
import java.time.Duration

val kafkaClient = KafkaClient()

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)

    Runtime.getRuntime().addShutdownHook(object : Thread() {
        override fun run() = runBlocking {
            println("Shutting down gracefully")
            kafkaClient.disconnect()
        }
    })
}

@ExperimentalCoroutinesApi
@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    install(CORS) {
        anyHost()
        HttpMethod.DefaultMethods.forEach { method(it) }
        header(HttpHeaders.ContentType)
    }

    install(WebSockets) {
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    routing {
        webSocket("/") {
            kafkaClient.addSession(this)

            try {
                incoming.consumeEach { frame ->
                    when (frame) {
                        is Frame.Text -> {
                            val text = frame.readText()
                            println("Received: $text")

                            when (val messageFromClient = MessageFromClient.parse(text)) {
                                is RequestConnect -> kafkaClient.connect(
                                    messageFromClient.environmentId,
                                    messageFromClient.brokers,
                                    messageFromClient.authenticationStrategy,
                                    messageFromClient.username,
                                    messageFromClient.password
                                )
                                is RequestDisconnect -> kafkaClient.disconnect()
                                is SubscribeToRecordsOfTopic -> kafkaClient.subscribeToRecordsOfTopic(messageFromClient.topic)
                                is UnsubscribeFromRecordsOfTopic -> kafkaClient.unsubscribeFromRecordsOfTopic(messageFromClient.topic)
                            }
                        }

                        is Frame.Close -> {
                            kafkaClient.removeSession(this)
                        }
                    }
                }
            } finally {
                kafkaClient.removeSession(this)
            }
        }
    }
}

