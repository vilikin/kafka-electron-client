import React, { FunctionComponent } from "react";
import { KafkaRecord } from "../../kafka/message-from-server";

export interface RecordProps {
  record: KafkaRecord;
}

export const Record: FunctionComponent<RecordProps> = ({ record }) => {
  return (
    <div className="mb-3 p-3 mr-2 border border-gray-300 rounded">
      <div className="text-gray-600 mb-1">
        Offset {record.offset} | Partition {record.partition} | Timestamp:{" "}
        {new Date(record.timestamp).toISOString()}
      </div>
      <div className="mb-1 text-gray-700 overflow-hidden truncate break-all">
        <strong>Key:</strong> {record.key}
      </div>
      <div className="text-gray-700 overflow-hidden truncate break-all">
        <strong>Value:</strong> {record.value}
      </div>
    </div>
  );
};
