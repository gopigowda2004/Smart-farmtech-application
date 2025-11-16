package com.farmtech.backend.repository;

import com.farmtech.backend.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.otp = :otp, u.otpExpiry = :expiry WHERE u.id = :userId")
    void updateOtpForUser(@Param("userId") Long userId,
                          @Param("otp") String otp,
                          @Param("expiry") Instant expiry);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.otp = NULL, u.otpExpiry = NULL WHERE u.id = :userId")
    void clearOtpForUser(@Param("userId") Long userId);
}
