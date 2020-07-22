package `in`.vilik

import `in`.vilik.kafka.KafkaClient
import `in`.vilik.model.*
import io.ktor.application.install
import io.ktor.features.CORS
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.cio.websocket.Frame
import io.ktor.http.cio.websocket.pingPeriod
import io.ktor.http.cio.websocket.readText
import io.ktor.http.cio.websocket.timeout
import io.ktor.routing.routing
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.websocket.WebSockets
import io.ktor.websocket.webSocket
import kotlinx.cli.ArgParser
import kotlinx.cli.ArgType
import kotlinx.cli.required
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.consumeEach
import java.time.Duration
import kotlin.system.exitProcess

val kafkaClient = KafkaClient()

@ExperimentalCoroutinesApi
fun main(args: Array<String>) {
  val parser = ArgParser("kafka-backend-client")
  val port by parser.option(ArgType.Int).required()
  parser.parse(args)

  Runtime.getRuntime().addShutdownHook(object : Thread() {
    override fun run() {
      println("Shutting down gracefully")
      kafkaClient.disconnect(DisconnectReason.APPLICATION_EXITING)
    }
  })

  try {
    embeddedServer(Netty, port) {
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
                    is RequestDisconnect -> kafkaClient.disconnect(DisconnectReason.CLIENT_REQUESTED_DISCONNECT)
                    is SubscribeToRecordsOfTopic -> kafkaClient.subscribeToRecordsOfTopic(
                      messageFromClient.topic
                    )
                    is UnsubscribeFromRecordsOfTopic -> kafkaClient.unsubscribeFromRecordsOfTopic(
                      messageFromClient.topic
                    )
                    is SubscribeToOffsetsOfConsumerGroup ->
                      kafkaClient.subscribeToOffsetsOfConsumerGroup(
                        messageFromClient.groupId
                      )
                    is UnsubscribeFromOffsetsOfConsumerGroup ->
                      kafkaClient.unsubscribeFromOffsetsOfConsumerGroup(
                        messageFromClient.groupId
                      )
                    is SubscribeToOffsetsOfTopic -> kafkaClient.subscribeToOffsetsOfTopic(
                      messageFromClient.topic
                    )
                    is UnsubscribeFromOffsetsOfTopic -> kafkaClient.unsubscribeFromOffsetsOfTopic(
                      messageFromClient.topic
                    )
                    is ProduceRecord -> kafkaClient.produceRecord(
                      messageFromClient.topic,
                      messageFromClient.key,
                      messageFromClient.value
                    )
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
    }.start(wait = false)
  } catch (e: Exception) {
    println("Exception occurred while starting up the server, exiting")
    e.printStackTrace()
    exitProcess(1)
  }
}


