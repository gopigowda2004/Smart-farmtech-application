package com.farmtech.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "http://localhost:3000")
@ConditionalOnProperty(prefix = "ml", name = "enabled", havingValue = "true")
public class MLController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.service.base:http://localhost:5001}")
    private String mlServiceBase; // e.g., http://ml-service:5001 in docker-compose

    @PostMapping("/crop-recommendation")
    public ResponseEntity<?> cropRecommendation(@RequestBody Map<String, Object> payload) {
        return forwardJson("/crop-recommendation", payload);
    }

    @PostMapping("/fertilizer-prediction")
    public ResponseEntity<?> fertilizerPrediction(@RequestBody Map<String, Object> payload) {
        return forwardJson("/fertilizer-prediction", payload);
    }

    @PostMapping("/crop-yield-estimation")
    public ResponseEntity<?> cropYieldEstimation(@RequestBody Map<String, Object> payload) {
        return forwardJson("/crop-yield-estimation", payload);
    }

    @PostMapping("/soil-analysis")
    public ResponseEntity<?> soilAnalysis(@RequestBody Map<String, Object> payload) {
        return forwardJson("/soil-analysis", payload);
    }

    @PostMapping("/chatbot/chat")
    public ResponseEntity<?> chatbotChat(@RequestBody Map<String, Object> payload) {
        return forwardJson("/api/chatbot/chat", payload);
    }

    @PostMapping("/chatbot/translate")
    public ResponseEntity<?> translate(@RequestBody Map<String, Object> payload) {
        return forwardJson("/api/chatbot/translate", payload);
    }

    @PostMapping("/chatbot/detect-language")
    public ResponseEntity<?> detectLanguage(@RequestBody Map<String, Object> payload) {
        return forwardJson("/api/chatbot/detect-language", payload);
    }

    @GetMapping("/health")
    public ResponseEntity<?> mlServiceHealth() {
        try {
            String url = mlServiceBase + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(503).body("{\"status\":\"unavailable\",\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // Image upload would typically be multipart; keep JSON forwarder here and add multipart later

    private ResponseEntity<?> forwardJson(String path, Map<String, Object> payload) {
        String url = mlServiceBase + path;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}