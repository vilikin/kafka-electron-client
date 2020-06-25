# Kafka Electron Client

Very much a work in progress still. :)

## Development

### Prerequisites

- Yarn
- Node.js
- Kotlin (for developing the backend that talks to Kafka)
- Java (for building and running the backend JAR)

### Running development environment

1. Build backend JAR by running `./gradlew shadowJar` in the `backend` directory
1. Run the development environment for Electron app with `yarn electron-dev`

This will start Overmind developer tools, spawn the backend process and open the Electron app.
