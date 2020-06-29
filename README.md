# Kafka Electron Client

A simple Kafka client for consuming / producing Kafka records, checking offsets etc. Not by any means full featured, and still very much work in progress. Use at your own risk :)

## Development

### Prerequisites

- Yarn
- Node.js
- Kotlin (for developing the backend that talks to Kafka)
- Java (for building and running the backend JAR)

### Running development environment

1. Build backend JAR by running `./backend/gradlew --project-dir backend shadowJar`
1. Run the development environment for Electron app with `yarn electron-dev`

This will start Overmind developer tools, spawn the backend process and open the Electron app.

## Releasing

This project uses GitHub actions to build and release the app.

Electron Builder publishes binaries to GitHub whenever a tag corresponding to the version in package.json is pushed, or a draft release already exists for the version in package.json.

Following flow should be used with releases:

1. After a release, immediately bump version in package.json and create a new draft release.
1. On each change, Electron Builder will automatically publish binaries as draft release exists.
1. When ready to actually release, just publish the release, and see first point to prepare next one.

## Features

- [X] Topic view: Consuming plaintext records
- [ ] Topic view: Consuming JSON records
- [ ] Topic view: Producing plaintext records
- [ ] Topic view: Producing JSON records
- [ ] Topic view: Seeking consumer to position
- [X] Sidebar: List topics
- [X] Sidebar: List consumer groups
- [ ] Sidebar: Search
- [X] Consumer group view: List offsets
- [ ] Consumer group view: Build lag graph
- [X] Environment config: SASL PLAIN Kafka auth
- [ ] Environment config: Custom Kafka auth
- [X] GitHub actions for automated releases
