
# Ref: https://github.com/bitnami/bitnami-docker-kafka/blob/master/docker-compose.yml
docker-compose up -d
docker-compose ps

# Run the below commands if you want to destroy Kafka 
# docker-compose down
# docker volume prune -f