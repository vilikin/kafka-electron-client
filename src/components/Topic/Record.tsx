import React, { FunctionComponent, useCallback, useState } from "react";
import { EnrichedKafkaRecord } from "../../overmind/connection/state";
import classNames from "classnames";

export interface RecordProps {
  record: EnrichedKafkaRecord;
}

export const Record: FunctionComponent<RecordProps> = ({ record }) => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = useCallback(() => {
    if (record.keyHtml || record.valueHtml) {
      setCollapsed(!collapsed);
    }
  }, [collapsed, setCollapsed, record]);

  return (
    <div
      className={classNames("mb-3 p-3 mr-2 border border-gray-300 rounded", {
        "cursor-pointer hover:border-gray-400":
          record.keyHtml || record.valueHtml,
      })}
      onClick={toggleCollapse}
    >
      <div className="text-gray-600 mb-1">
        Offset {record.offset} | Partition {record.partition} | Timestamp:{" "}
        {new Date(record.timestamp).toISOString()}
      </div>
      {collapsed ? (
        <>
          <div className="mb-1 text-gray-700 overflow-hidden truncate break-all">
            <strong>Key:</strong> {record.key}
          </div>
          <div className="text-gray-700 overflow-hidden truncate break-all">
            <strong>Value:</strong> {record.value}
          </div>
        </>
      ) : (
        <>
          <div className="mb-1 text-gray-700 overflow-hidden truncate break-all">
            <strong>Key:</strong>
            {
              <div
                dangerouslySetInnerHTML={{
                  __html: record.keyHtml ?? record.key ?? "null",
                }}
              />
            }
          </div>
          <div className="text-gray-700 overflow-hidden truncate break-all">
            <strong>Value:</strong>
            {
              <div
                dangerouslySetInnerHTML={{
                  __html: record.valueHtml ?? record.value,
                }}
              />
            }
          </div>
        </>
      )}
    </div>
  );
};
