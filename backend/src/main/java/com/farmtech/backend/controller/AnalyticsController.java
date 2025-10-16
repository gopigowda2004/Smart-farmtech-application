package com.farmtech.backend.controller;

import com.farmtech.backend.dto.AnalyticsResponse;
import com.farmtech.backend.service.BookingAnalyticsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AnalyticsController {

    private final BookingAnalyticsService bookingAnalyticsService;

    public AnalyticsController(BookingAnalyticsService bookingAnalyticsService) {
        this.bookingAnalyticsService = bookingAnalyticsService;
    }

    @GetMapping("/global")
    public AnalyticsResponse getGlobalAnalytics() {
        return bookingAnalyticsService.getGlobalAnalytics();
    }

    @GetMapping("/farmer/{farmerId}")
    public AnalyticsResponse getFarmerAnalytics(@PathVariable Long farmerId) {
        return bookingAnalyticsService.getFarmerAnalytics(farmerId);
    }
}