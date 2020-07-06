import { ChildProcessWithoutNullStreams } from "child_process";

const path = window.require("path");
const fs = window.require("fs");
const { spawn } = window.require("child_process");
const isDev = window.require("electron-is-dev");
const tcpPortUsed = window.require("tcp-port-used");
const { remote } = window.require("electron");

function getBackendJarPath() {
  const backendJarPath = isDev
    ? path.join(
        remote.app.getAppPath(),
        "backend/build/libs/kafkaui-0.0.1-all.jar"
      )
    : path.join(remote.process.resourcesPath, "kafkaui-0.0.1-all.jar");

  if (!fs.existsSync(backendJarPath)) {
    throw new Error(`Backend JAR file not found from ${backendJarPath}`);
  }

  return backendJarPath;
}

export async function spawnBackendProcess(
  port: number
): Promise<ChildProcessWithoutNullStreams> {
  return new Promise(async (resolve, reject) => {
    try {
      const backendJarPath = getBackendJarPath();

      console.log("Spawning backend process from " + backendJarPath);
      const backend = spawn("java", [
        "-jar",
        backendJarPath,
        "--port",
        port.toString(10),
      ]);

      window.addEventListener("beforeunload", () => {
        backend.kill();
      });

      process.on("exit", () => {
        backend.kill();
      });

      await tcpPortUsed.waitUntilUsed(37452, 500, 15_000);
      resolve(backend);
    } catch (e) {
      reject(e);
    }
  });
}
