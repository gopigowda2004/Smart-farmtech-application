# syntax=docker/dockerfile:1

# Build stage
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /build

# Copy only pom first to cache dependencies
COPY pom.xml .
RUN mvn -q -B -DskipTests dependency:go-offline

# Copy sources and build
COPY src src
RUN mvn -q -B -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar
COPY --from=build /build/target/*.jar /app/app.jar

EXPOSE 8080
# JAVA_OPTS allows passing extra JVM options if needed
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]