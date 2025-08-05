FROM gradle:8.10-jdk17 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle dependencies --no-daemon
COPY src ./src
RUN gradle build --no-daemon -x test

FROM eclipse-temurin:17-jre-alpine AS production
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001 -G appuser
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1
CMD ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]