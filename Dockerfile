FROM node:6.9.5

ADD . /var/www/nodeFramework
WORKDIR /var/www/nodeFramework

ADD id_rsa /root/.ssh/id_rsa
RUN echo "Host gitlab.innonic.com\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

RUN npm install

EXPOSE 3000

CMD ["node", "app.js"]
