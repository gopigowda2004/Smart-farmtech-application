package com.farmtech.backend.service;

import com.farmtech.backend.entity.User;
import com.farmtech.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Removed existsByAadhar method as Aadhar is no longer used

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
