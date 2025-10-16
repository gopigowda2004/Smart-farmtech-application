package com.farmtech.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "http://localhost:3000")
@ConditionalOnProperty(prefix = "ml", name = "enabled", havingValue = "true")
public class MLUploadController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.service.base:http://localhost:5001}")
    private String mlServiceBase;

    @PostMapping(value = "/plant-disease-detection", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> plantDiseaseDetection(@RequestPart("file") MultipartFile file) throws Exception {
        String url = mlServiceBase + "/plant-disease-detection";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Wrap file bytes into a Resource with filename so FastAPI receives proper metadata
        ByteArrayResource fileAsResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new HttpEntity<>(fileAsResource, createFileHeaders(file)));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    private HttpHeaders createFileHeaders(MultipartFile file) {
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));
        ContentDisposition cd = ContentDisposition.builder("form-data")
                .name("file")
                .filename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg")
                .build();
        fileHeaders.setContentDisposition(cd);
        return fileHeaders;
    }
}