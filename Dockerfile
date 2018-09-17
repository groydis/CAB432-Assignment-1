FROM node:carbon
MAINTAINER greyden
ADD . /App
EXPOSE 3000
WORKDIR /App/BuzzTone
ENV NODE_ENV production
RUN npm install
CMD npm start