FROM node:carbon
WORKDIR /App
ADD . /App
EXPOSE 3000
WORKDIR /App/BuzzTone
ENV NODE_ENV production
RUN npm install
CMD npm start