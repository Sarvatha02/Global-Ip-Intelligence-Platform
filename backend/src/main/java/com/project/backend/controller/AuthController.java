package com.project.backend.controller;

import com.project.backend.dto.LoginRequest;
import com.project.backend.dto.RegisterRequest;
import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.UserService;
import com.project.backend.util.JwtUtil;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // ----------------------------------------------------------------
    // ⚙️ CONFIGURATION
    // ----------------------------------------------------------------
    // Default to localhost for stability. 
    // If testing on mobile via LAN, change this to "http://192.168.x.x:5173"
    private final String FRONTEND_URL = "http://localhost:5173"; 

    // ==========================================
    // 🔐 LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("🔹 Login Attempt: " + loginRequest.getEmail());
        
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String rawPassword = loginRequest.getPassword();
            String storedPassword = user.getPassword();

            // 1. STANDARD: Check if password matches the Hash
            if (passwordEncoder.matches(rawPassword, storedPassword)) {
                System.out.println("✅ Login Success (Hash Match)");
                String token = jwtUtil.generateToken(user.getEmail());
                return ResponseEntity.ok(Map.of("token", token, "user", sanitizeUser(user)));
            } 
            
            // 2. AUTO-FIX: Check if password matches Plain Text (Legacy Data Migration)
            else if (rawPassword.equals(storedPassword)) {
                System.out.println("⚠️ Plain text detected. Migrating to Hash...");
                
                // Encrypt and Save
                user.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(user);
                System.out.println("✅ Password Migrated & Login Success");
                
                String token = jwtUtil.generateToken(user.getEmail());
                return ResponseEntity.ok(Map.of("token", token, "user", sanitizeUser(user)));
            }
        } else {
            System.out.println("❌ User Not Found in Database");
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid Email or Password"));
    }

    // ==========================================
    // 📝 REGISTER
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("message", "Email already registered"));
        }

        try {
            User newUser = new User();
            newUser.setName(registerRequest.getName());
            newUser.setEmail(registerRequest.getEmail());
            // Security: Always encrypt new passwords immediately
            newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword())); 
            newUser.setUserType(registerRequest.getUserType());

            User savedUser = userRepository.save(newUser);
            
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return ResponseEntity.ok(Map.of("token", token, "user", sanitizeUser(savedUser)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    // ==========================================
    // 🔥 FIREBASE / GOOGLE LOGIN
    // ==========================================

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("idToken");
        if (idToken == null) return ResponseEntity.badRequest().body(Map.of("message", "ID Token missing"));
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            User user = userService.findOrCreateFirebaseUser(decodedToken.getEmail(), decodedToken.getName(), decodedToken.getUid());
            String localJwt = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(Map.of("token", localJwt, "user", sanitizeUser(user)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Auth failed"));
        }
    }

    // ==========================================
    // 📧 PASSWORD RECOVERY
    // ==========================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String userEmail = payload.get("email"); 
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If an account exists, a link has been sent."));
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Create Mobile-Friendly Link
        String resetLink = FRONTEND_URL + "/login?token=" + token;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail); 
            message.setTo(userEmail);     
            message.setSubject("Reset Password - Action Required");
            message.setText("Hello " + user.getName() + ",\n\n" +
                    "Click here to reset your password:\n" + resetLink + "\n\n" +
                    "Link expires in 1 hour.");

            mailSender.send(message);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send email."));
        }

        return ResponseEntity.ok(Map.of("message", "Reset link sent successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("password");

        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty() || userOpt.get().getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired token."));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword)); 
        user.setResetToken(null);       
        user.setResetTokenExpiry(null); 
        
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully! Please login."));
    }

    // ==========================================
    // 🛡️ SECURITY HELPER
    // ==========================================

    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> safeUser = new HashMap<>();
        safeUser.put("id", user.getId());
        safeUser.put("name", user.getName());
        safeUser.put("email", user.getEmail());
        safeUser.put("userType", user.getUserType());
        safeUser.put("avatar", user.getAvatar());
        safeUser.put("bio", user.getBio());
        safeUser.put("phone", user.getPhone());
        safeUser.put("jobTitle", user.getJobTitle());
        safeUser.put("company", user.getCompany());
        safeUser.put("location", user.getLocation());
        safeUser.put("linkedin", user.getLinkedin());
        safeUser.put("website", user.getWebsite());
        safeUser.put("planType", user.getPlanType());
        safeUser.put("renewalDate", user.getRenewalDate());
        safeUser.put("billingCycle", user.getBillingCycle());
        safeUser.put("amountPaid", user.getAmountPaid());
        
        return safeUser;
    }
}