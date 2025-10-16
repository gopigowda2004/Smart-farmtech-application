package com.farmtech.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class GeocodingService {

    @Value("${google.maps.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Optional<Coordinates> geocodeAddress(String address) {
        if (address == null || address.isBlank() || apiKey == null || apiKey.isBlank()) {
            return Optional.empty();
        }
        try {
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = String.format("https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s", encodedAddress, apiKey);
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Optional.empty();
            }
            JsonNode results = response.getBody().path("results");
            if (!results.isArray() || results.isEmpty()) {
                return Optional.empty();
            }
            JsonNode location = results.get(0).path("geometry").path("location");
            if (!location.has("lat") || !location.has("lng")) {
                return Optional.empty();
            }
            double lat = location.get("lat").asDouble();
            double lng = location.get("lng").asDouble();
            return Optional.of(new Coordinates(lat, lng));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public record Coordinates(double latitude, double longitude) {}
}