package com.project.backend.service;

import com.project.backend.dto.UserManagementDTO;
import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder; // Change to BCryptPasswordEncoder if specific needed
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserManagementService {
    
    // ✅ Manual Logger
    private static final Logger log = LoggerFactory.getLogger(UserManagementService.class);

    private final UserRepository userRepo;
    private final ActivityLoggerService activityLogger;
    private final PasswordEncoder passwordEncoder; // Assuming you have a PasswordEncoder bean

    // ✅ Manual Constructor Injection (No Lombok @RequiredArgsConstructor)
    public UserManagementService(UserRepository userRepo, 
                                 ActivityLoggerService activityLogger,
                                 PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.activityLogger = activityLogger;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get all users
     */
    public List<UserManagementDTO> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new user
     */
    @Transactional
    public UserManagementDTO createUser(UserManagementDTO.UserCreateRequest request, User admin) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        // Encode password (default to a placeholder if not provided, or handle logic)
        String rawPassword = request.getPassword() != null ? request.getPassword() : "Default@123";
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        
        newUser.setRole(request.getRole() != null ? request.getRole() : "USER");
        // Ensure User entity has this field, or remove if not needed
        // newUser.setUserType(request.getUserType()); 
        
        User savedUser = userRepo.save(newUser);

        activityLogger.logActivity(admin, "USER_CREATE", "Created user: " + savedUser.getEmail());
        log.info("Admin {} created user {}", admin.getEmail(), savedUser.getEmail());

        return convertToDTO(savedUser);
    }

    /**
     * Update user role
     */
    @Transactional
    public UserManagementDTO updateUserRole(Long userId, String newRole, User admin) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldRole = user.getRole();
        user.setRole(newRole);
        User savedUser = userRepo.save(user);

        activityLogger.logActivity(admin, "ROLE_UPDATE", 
                "Updated role for " + user.getEmail() + " from " + oldRole + " to " + newRole);
        
        return convertToDTO(savedUser);
    }

    /**
     * Toggle user status (Enable/Disable logic stub)
     */
    @Transactional
    public UserManagementDTO toggleUserStatus(Long userId, User admin) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Assuming you might add an 'isActive' field later. 
        // For now, we just return the user to satisfy the controller.
        // If you have an active field: user.setActive(!user.isActive());
        
        log.info("Toggled status for user {}", user.getEmail());
        return convertToDTO(user);
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long userId, User admin) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepo.delete(user);
        
        activityLogger.logActivity(admin, "USER_DELETE", "Deleted user: " + user.getEmail());
        log.info("Admin {} deleted user {}", admin.getEmail(), user.getEmail());
    }

    /**
     * Helper to convert Entity to DTO
     */
    private UserManagementDTO convertToDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        // dto.setCreatedAt(user.getCreatedAt()); // Uncomment if User entity has createdAt
        return dto;
    }
}