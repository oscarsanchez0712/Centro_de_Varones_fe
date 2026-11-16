# Ejecuta desde la raíz Centro_de_varones_be para construir solo la imagen:
# docker build -t centro-varones-api:1.0.0 -f dockerfile-Fabrizio/Dockerfile .
# Para construirla e iniciar backend en el Compose unificado:
# docker compose --env-file docker-compose-Fabrizio/.env -p centro-varones -f docker-compose-Fabrizio/docker-compose.yml up -d --build backend
#
# Etapa 1: Maven compila este proyecto y genera el JAR de la API.
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src src
RUN mvn -B -DskipTests package

# Etapa 2: empaqueta el JAR en una imagen runtime propia de Centro de Varones.
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/centro-varones-api.jar app.jar
EXPOSE 8085
# Al iniciar el contenedor, este comando ejecuta Spring Boot.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
