package com.farmtech.backend.dto;

import java.math.BigDecimal;

public class AnalyticsResponse {

    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private BigDecimal confirmedRevenue;
    private Double averageConfirmationTimeMinutes;

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getConfirmedRevenue() {
        return confirmedRevenue;
    }

    public void setConfirmedRevenue(BigDecimal confirmedRevenue) {
        this.confirmedRevenue = confirmedRevenue;
    }

    public Double getAverageConfirmationTimeMinutes() {
        return averageConfirmationTimeMinutes;
    }

    public void setAverageConfirmationTimeMinutes(Double averageConfirmationTimeMinutes) {
        this.averageConfirmationTimeMinutes = averageConfirmationTimeMinutes;
    }
}