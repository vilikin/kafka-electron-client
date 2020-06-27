package `in`.vilik.kafka

import `in`.vilik.model.AuthenticationStrategy
import org.apache.kafka.clients.admin.AdminClientConfig
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.kafka.common.serialization.StringSerializer

data class KafkaProps(
  val producerProps: Map<String, String>,
  val consumerProps: Map<String, String>,
  val adminClientProps: Map<String, String>
)

fun getKafkaProps(
  environmentId: String,
  brokers: List<String>,
  authenticationStrategy: AuthenticationStrategy,
  username: String?,
  password: String?
): KafkaProps {
  fun combineWithAuthProps(map: Map<String, String>): Map<String, String> {
    val authProps = if (authenticationStrategy == AuthenticationStrategy.SASL_PLAIN)
      mutableMapOf(
        "security.protocol" to "SASL_SSL",
        "sasl.mechanism" to "PLAIN",
        "sasl.jaas.config" to
          (
            "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"" +
              username +
              "\" password=\"" +
              password +
              "\";"
            )
      ) else mutableMapOf()

    authProps.putAll(map)
    return authProps
  }

  val producerProps = combineWithAuthProps(
    mutableMapOf(
      ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG to StringSerializer::class.java.name,
      ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG to StringSerializer::class.java.name,
      ProducerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
      ProducerConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId",
      ProducerConfig.RETRIES_CONFIG to "5",
      ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG to "5000"
    )
  )

  val consumerProps = combineWithAuthProps(
    mutableMapOf(
      ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
      ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
      ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
      ConsumerConfig.GROUP_ID_CONFIG to "kafka-ui-group-$environmentId",
      ConsumerConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId",
      ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG to "false"
    )
  )

  val adminClientProps = combineWithAuthProps(
    mutableMapOf(
      AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG to brokers.joinToString(),
      AdminClientConfig.CLIENT_ID_CONFIG to "kafka-ui-client-$environmentId",
      AdminClientConfig.RETRIES_CONFIG to "5",
      AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG to "5000",
      AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG to "5000"
    )
  )

  return KafkaProps(
    producerProps,
    consumerProps,
    adminClientProps
  )
}