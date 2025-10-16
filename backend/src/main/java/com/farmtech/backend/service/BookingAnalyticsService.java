package com.farmtech.backend.service;

import com.farmtech.backend.dto.AnalyticsResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class BookingAnalyticsService {

    @PersistenceContext
    private EntityManager entityManager;


    @Transactional(readOnly = true)
    public AnalyticsResponse getGlobalAnalytics() {
        String sql = """
                SELECT
                    COUNT(*) AS total_bookings,
                    SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed_bookings,
                    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_bookings,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_bookings,
                    COALESCE(SUM(total_cost), 0) AS total_revenue,
                    COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN total_cost ELSE 0 END), 0) AS confirmed_revenue,
                    AVG(CASE WHEN confirmed_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, created_at, confirmed_at) END) AS avg_confirmation_minutes
                FROM bookings;
                """;

        Query query = entityManager.createNativeQuery(sql);
        Object[] result = (Object[]) query.getSingleResult();
        return mapResultToResponse(result);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getFarmerAnalytics(Long farmerId) {
        String sql = """
                SELECT
                    COUNT(*) AS total_bookings,
                    SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed_bookings,
                    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_bookings,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_bookings,
                    COALESCE(SUM(total_cost), 0) AS total_revenue,
                    COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN total_cost ELSE 0 END), 0) AS confirmed_revenue,
                    AVG(CASE WHEN confirmed_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, created_at, confirmed_at) END) AS avg_confirmation_minutes
                FROM bookings
                WHERE (owner_id = :farmerId OR accepted_owner_id = :farmerId);
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("farmerId", farmerId);
        Object[] result = (Object[]) query.getSingleResult();
        return mapResultToResponse(result);
    }

    private AnalyticsResponse mapResultToResponse(Object[] result) {
        AnalyticsResponse response = new AnalyticsResponse();
        response.setTotalBookings(((Number) result[0]).longValue());
        response.setConfirmedBookings(((Number) result[1]).longValue());
        response.setPendingBookings(((Number) result[2]).longValue());
        response.setCancelledBookings(((Number) result[3]).longValue());
        response.setTotalRevenue(toBigDecimal(result[4]));
        response.setConfirmedRevenue(toBigDecimal(result[5]));
        response.setAverageConfirmationTimeMinutes(result[6] != null ? ((Number) result[6]).doubleValue() : null);
        return response;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return BigDecimal.ZERO;
    }
}