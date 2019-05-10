FROM node:10
# Install PDF Creator globaly
RUN npm install -g html-pdf
# Create app directory
WORKDIR /usr/src/app

# VOLUME ./proposals /usr/src/app/public/proposals
# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]