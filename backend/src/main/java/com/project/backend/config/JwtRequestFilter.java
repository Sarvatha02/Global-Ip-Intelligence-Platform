package com.project.backend.config;

import com.project.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService; 
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
                String path = request.getRequestURI(); 

        if (path.contains("/api/auth/")) {
        chain.doFilter(request, response);
        return;
    }

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 🔍 DEBUG LOG 1: Check if Header exists
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
        
            if (request.getRequestURI().startsWith("/api/")) {
                System.out.println("⚠️ JWT Filter: No Token found for URL: " + request.getRequestURI());
            }
        }

        // 1. Check valid Header
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                // 🔍 DEBUG LOG 2: Username extracted
                System.out.println("✅ JWT Filter: Token received. Extracted Username: " + username);
            } catch (Exception e) {
                // 🔍 DEBUG LOG 3: Extraction failed
                System.out.println("❌ JWT Filter: Error extracting username. Msg: " + e.getMessage());
            }
        }

        // 2. Validate Token & Set Authentication
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // ✅ Pass username String
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) { 
                
                // 🔍 DEBUG LOG 4: Success
                System.out.println("🔓 JWT Filter: Token VALID. Logging in user: " + username);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                // 🔍 DEBUG LOG 5: Failed Validation
                System.out.println("⛔ JWT Filter: Token INVALID or EXPIRED for user: " + username);
            }
        }
        chain.doFilter(request, response);
    }
}