package com.project.backend.service;

import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String UPLOAD_DIR = "uploads/avatars/";

    public List<User> getAllUsers() { return userRepository.findAll(); }

    public Optional<User> findByEmail(String email) { return userRepository.findByEmail(email); }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword())); 
        return userRepository.save(user);
    }

    public User updateUserProfile(Long id, User updates) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getName() != null) existingUser.setName(updates.getName());
        if (updates.getPhone() != null) existingUser.setPhone(updates.getPhone());
        if (updates.getJobTitle() != null) existingUser.setJobTitle(updates.getJobTitle());
        if (updates.getCompany() != null) existingUser.setCompany(updates.getCompany());
        if (updates.getLocation() != null) existingUser.setLocation(updates.getLocation());
        if (updates.getBio() != null) existingUser.setBio(updates.getBio());
        if (updates.getLinkedin() != null) existingUser.setLinkedin(updates.getLinkedin());
        if (updates.getWebsite() != null) existingUser.setWebsite(updates.getWebsite());

        return userRepository.save(existingUser);
    }

    public String saveAvatar(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        String fileUrl = "http://localhost:5001/uploads/avatars/" + filename;
        user.setAvatar(fileUrl);
        userRepository.save(user);

        return fileUrl;
    }

    // --- 🔴 DELETE LOGIC ---
    public void deleteAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Remove the reference from the database
        user.setAvatar(null);
        userRepository.save(user);
    }

    @Transactional
    public User findOrCreateFirebaseUser(String email, String name, String firebaseUid) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) return userOptional.get();
        
        User newUser = new User();
        newUser.setName(name); 
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(firebaseUid)); 
        newUser.setUserType("Individual"); 
        
        return userRepository.save(newUser);
    }
}