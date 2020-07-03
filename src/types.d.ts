import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import * as electron_is_dev from "electron-is-dev";
import * as tcp_port_used from "tcp-port-used";
import * as electron from "electron";

declare global {
  interface Window {
    require(moduleSpecifier: "fs"): typeof fs;
    require(moduleSpecifier: "path"): typeof path;
    require(moduleSpecifier: "child_process"): typeof child_process;
    require(moduleSpecifier: "electron-is-dev"): typeof electron_is_dev;
    require(moduleSpecifier: "tcp-port-used"): typeof tcp_port_used;
    require(moduleSpecifier: "electron"): typeof electron;
  }
}
