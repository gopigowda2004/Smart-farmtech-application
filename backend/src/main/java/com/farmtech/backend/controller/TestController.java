package com.farmtech.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello World!");
    }
    
    @PostMapping("/echo")
    public ResponseEntity<String> echo(@RequestBody String message) {
        return ResponseEntity.ok("Echo: " + message);
    }
}