package com.farmtech.backend.repository;

import com.farmtech.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByOwner_IdNot(Long ownerId); // Other farmers' equipment
    List<Equipment> findByOwner_Id(Long ownerId);    // Farmer's own equipment
    List<Equipment> findByType(String type); // Find equipment by type
}