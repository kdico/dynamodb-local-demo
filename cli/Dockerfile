FROM amazon/aws-cli:2.3.6

ENTRYPOINT []

ENV AWS_REGION=DUMMY
ENV AWS_ACCESS_KEY_ID=DUMMY
ENV AWS_SECRET_ACCESS_KEY=DUMMY

RUN mkdir /cli
WORKDIR /cli

COPY . .
RUN chmod +x ./create-table.sh
