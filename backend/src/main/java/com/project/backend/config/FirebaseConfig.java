package com.project.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // 1. Check if Firebase is already running
            List<FirebaseApp> apps = FirebaseApp.getApps();
            if (apps != null && !apps.isEmpty()) {
                return;
            }

            InputStream serviceAccount = null;
            
            // 🔍 CHECK 1: Try Loading from Environment Variable (JSON String - Render / Production)
            String jsonConfig = System.getenv("FIREBASE_CONFIG_JSON");
            if (jsonConfig != null && !jsonConfig.isEmpty()) {
                System.out.println("🌍 Loading Firebase from FIREBASE_CONFIG_JSON string");
                serviceAccount = new java.io.ByteArrayInputStream(jsonConfig.getBytes());
            }

            // 🔍 CHECK 2: Try Loading from GOOGLE_APPLICATION_CREDENTIALS path
            if (serviceAccount == null) {
                String envPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                if (envPath != null && !envPath.isEmpty()) {
                    System.out.println("🌍 Loading Firebase from ENV Path: " + envPath);
                    try {
                        serviceAccount = new FileInputStream(envPath);
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to load from ENV path, falling back to classpath.");
                    }
                }
            }

            // 🔍 CHECK 2: Fallback to Classpath (Localhost / Resources folder)
            if (serviceAccount == null) {
                System.out.println("🏠 Loading Firebase from Classpath (src/main/resources)");
                serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
            }

            // ❌ FINAL CHECK: If file is still missing
            if (serviceAccount == null) {
                System.err.println("❌ FATAL ERROR: serviceAccountKey.json not found anywhere!");
                throw new RuntimeException("serviceAccountKey.json missing");
            }

            // 3. Configure Firebase
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase Initialized Successfully!");

        } catch (Exception e) {
            System.err.println("❌ Firebase Initialization Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}