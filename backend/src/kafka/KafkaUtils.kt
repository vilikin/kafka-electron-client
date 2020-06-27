package `in`.vilik.kafka

import org.apache.kafka.clients.admin.Admin
import org.apache.kafka.clients.admin.OffsetSpec
import org.apache.kafka.clients.admin.TopicListing
import org.apache.kafka.common.Node
import org.apache.kafka.common.TopicPartition

data class Partition(
  val id: Int,
  val replicas: List<Int>,
  val inSyncReplicas: List<Int>,
  val leader: Int
)

data class PartitionOffsets(
  val topic: String,
  val partition: Int,
  val earliest: Long,
  val latest: Long
)

data class Topic(
  val id: String,
  val isInternal: Boolean,
  val partitions: List<Partition>
)

data class ConsumerGroup(
  val id: String,
  val offsets: List<ConsumerGroupOffsetForPartition>
)

data class ConsumerGroupOffsetForPartition(
  val topic: String,
  val partition: Int,
  val offset: Long
)

fun getTopics(admin: Admin): List<Topic> {
  val topics = admin.listTopics().listings().get()

  val topicDescriptions = admin.describeTopics(
    topics.map(TopicListing::name)
  ).all().get()

  return topics.map {
    val description = topicDescriptions[it.name()]!!
    Topic(
      description.name(),
      description.isInternal,
      description.partitions().map { partition ->
        Partition(
          partition.partition(),
          partition.replicas().map(Node::id),
          partition.isr().map(Node::id),
          partition.leader().id()
        )
      }
    )
  }
}

fun getAllConsumerGroups(
  admin: Admin,
  fetchOffsetsForGroups: Set<String> = emptySet()
): List<ConsumerGroup> =
  admin.listConsumerGroups().all().get()
    .map {
      val groupId = it.groupId()
      if (fetchOffsetsForGroups.contains(groupId)) {
        val offsets = admin.listConsumerGroupOffsets(groupId)
          .partitionsToOffsetAndMetadata().get()
          .map { (key, value) ->
            ConsumerGroupOffsetForPartition(
              key.topic(),
              key.partition(),
              value.offset()
            )
          }

        ConsumerGroup(groupId, offsets)
      } else {
        ConsumerGroup(groupId, emptyList())
      }
    }

fun getTopicOffsets(
  admin: Admin,
  topics: Set<String>
): List<PartitionOffsets> {
  val topicPartitions = admin.describeTopics(topics).all().get().values
    .flatMap { topic ->
      topic.partitions().map { partition ->
        TopicPartition(topic.name(), partition.partition())
      }
    }

  val requestForEarliestOffsets = topicPartitions.map {
    it to OffsetSpec.earliest()
  }.toMap()

  val requestForLatestOffsets = topicPartitions.map {
    it to OffsetSpec.latest()
  }.toMap()

  val earliestOffsets = admin.listOffsets(requestForEarliestOffsets)
    .all()
    .get()

  val latestOffsets = admin.listOffsets(requestForLatestOffsets)
    .all()
    .get()

  return (earliestOffsets.keys + latestOffsets.keys)
    .map {
      PartitionOffsets(
        it.topic(),
        it.partition(),
        earliestOffsets[it]?.offset() ?: error("map should contain all topics"),
        latestOffsets[it]?.offset() ?: error("map should contain all topics")
      )
    }
}