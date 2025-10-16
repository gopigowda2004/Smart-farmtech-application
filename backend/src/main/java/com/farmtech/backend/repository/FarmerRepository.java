package com.farmtech.backend.repository;

import com.farmtech.backend.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByPhone(String phone);
    Optional<Farmer> findByEmail(String email);
}
