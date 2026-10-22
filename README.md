
# KassiesRecipies

KassiesRecipies is a web application built using Next.js that allows users to explore and manage recipes. This README will guide you through setting up the project, running it in development mode, building the production version, deploying the app using Docker, and creating and transferring a Docker image tarball.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up the Development Environment](#setting-up-the-development-environment)
3. [Running the Development Server](#running-the-development-server)
4. [Building the Production Version](#building-the-production-version)
5. [Deploying the App Using Docker](#deploying-the-app-using-docker)
    1. [Building the Docker Image](#building-the-docker-image)
    2. [Running the Docker Container](#running-the-docker-container)
6. [Creating and Transferring a Docker Image Tarball](#creating-and-transferring-a-docker-image-tarball)
    1. [Building the Image](#building-the-image)
    2. [Saving the Image as a Tarball](#saving-the-image-as-a-tarball)
    3. [Loading and Running the Image](#loading-and-running-the-image)
7. [Environment Variables](#environment-variables)

## Prerequisites

Before you start, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/) (for containerization)
- [MongoDB](https://www.mongodb.com/try/download/community) (if you're running the database locally)

## Setting Up the Development Environment

1. Clone the repository:
   ```bash
   git clone git@github.com:VilSoft/KassiesRecipies.git
   cd KassiesRecipies
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root of the project and configure your environment variables (e.g., MongoDB connection string, etc.).

## Testing
```bash
npm run test
```

## Running the Development Server

To run the app in development mode, use the following command:

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`. You can open this URL in your browser to view the app.

## Building the Production Version

To build the production version of the app, run:

```bash
npm run build
```

This command generates the `.next` directory, which contains the optimized version of the app. After building, you can run the production version with:

```bash
npm run start
```

This will start the app in production mode at `http://localhost:3000`.

## Deploying the App Using Docker

### Building the Docker Image

1. Build the Docker image for the app:

   ```bash
   docker build -t kassiesrecipies:latest .
   ```

   This will create a Docker image named `kassiesrecipies:latest`.

### Running the Docker Container

1. Run the app as a Docker container:

   ```bash
   docker run -p 3000:3000 kassiesrecipies:latest
   ```

   The app will be available at `http://localhost:3000` within the container.

## Creating and Transferring a Docker Image Tarball to a Resberry Pi

### Building the Image

1. Build the Docker image targeting the `linux/arm64/v8` architecture (for Raspberry Pi):

   ```bash
   docker buildx build --platform linux/arm64/v8 -t kassiesrecipies:latest --load .
   ```

### Saving the Image as a Tarball

2. Save the image as a tarball for transfer:

   ```bash
   docker save -o kassiesrecipies-arm64.tar kassiesrecipies:latest
   ```

   This will generate the `kassiesrecipies-arm64.tar` file.

### Loading and Running the Image

3. Transfer the tarball to your Raspberry Pi:

   ```bash
   scp kassiesrecipies-arm64.tar pi@<your-pi-ip>:/home/pi/
   ```

4. SSH into your Raspberry Pi:

   ```bash
   ssh pi@<your-pi-ip>
   ```

5. Load the Docker image:

   ```bash
   docker load -i /home/pi/kassiesrecipies-arm64.tar
   ```

6. Run the app as a Docker container on the Raspberry Pi:

   ```bash
   docker run --network host -p 3000:3000 --restart always kassiesrecipies:latest
   ```

   The `--restart always` will ensure that the container will start on boot/crash

The app will be available at `http://localhost:3000` on your Raspberry Pi.

## Environment Variables

All optional — the app runs with no configuration. Set in `.env.local` (dev) or the container environment:

- `RECIPES_MONGO_URI`: MongoDB connection string. Defaults to `mongodb://localhost:27017/recipies`.

## Conclusion

This guide covered the basic steps for setting up the development environment, building the app for production, deploying it with Docker, and transferring the Docker image as a tarball for deployment on a Raspberry Pi. You should now be able to run the app locally and on your Pi with ease.

Let me know if you need further assistance or run into any issues!
