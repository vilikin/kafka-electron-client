import { KafkaRecord } from "../kafka/message-from-server";
import { EnrichedKafkaRecord } from "../overmind/connection/state";
import Prism from "prismjs";

function isJson(maybeJson: string) {
  try {
    JSON.parse(maybeJson);
    return true;
  } catch (e) {
    return false;
  }
}

function jsonToHtml(json: string): string {
  return Prism.highlight(
    JSON.stringify(JSON.parse(json), null, 4),
    Prism.languages.json,
    "json"
  )
    .replace(/(\r\n|\n|\r)/gm, "<br/>")
    .replace(/ {4}/gm, "&nbsp;&nbsp;&nbsp;&nbsp;");
}

export function enrichRecord(record: KafkaRecord): EnrichedKafkaRecord {
  let keyHtml;
  let valueHtml;

  if (record.key && isJson(record.key)) {
    keyHtml = jsonToHtml(record.key);
  }

  if (record.value && isJson(record.value)) {
    valueHtml = jsonToHtml(record.value);
  }

  return {
    ...record,
    keyHtml,
    valueHtml,
  };
}
