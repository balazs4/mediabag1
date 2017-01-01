
FROM node:alpine
MAINTAINER balazs4
LABEL Name=mediabag Version=2.0.0 
RUN apk add --update git && rm -rf /tmp/* /var/cache/apk/*
RUN npm install --global pm2 yarn
WORKDIR /srv
RUN git clone https://github.com/balazs4/mediabag.git
WORKDIR /srv/mediabag
RUN yarn
EXPOSE 5555
CMD ["pm2-docker", "npm", "--name", "mediabag", "--", "start"]
