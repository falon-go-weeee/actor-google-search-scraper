# First, specify the base Docker image. You can read more about
# the available images at https://sdk.apify.com/docs/guides/docker-images
# You can also use any other image from Docker Hub.
FROM apify/actor-node:16 as dev

WORKDIR /app

# Second, copy just package.json and package-lock.json since it should be
# the only file that affects "npm install" in the next step, to speed up the build
COPY package*.json ./

# Install NPM packages.
RUN npm --quiet set progress=false \
 && npm install --production=false

ENV APIFY_DISABLE_OUTDATED_WARNING 1
