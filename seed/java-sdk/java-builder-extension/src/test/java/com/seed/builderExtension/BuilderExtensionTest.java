package com.seed.builderExtension;

import com.seed.builderExtension.core.ClientOptions;
import com.seed.builderExtension.core.Environment;
import org.junit.Test;
import static org.junit.Assert.*;

public class BuilderExtensionTest {
    
    /**
     * Test that demonstrates the builder extension pattern
     */
    @Test
    public void testBuilderExtension() {
        // Create a custom client class that extends the base client
        class CustomClient extends SeedBuilderExtensionClient {
            private final String customField;
            
            public CustomClient(ClientOptions clientOptions, String customField) {
                super(clientOptions);
                this.customField = customField;
            }
            
            public String getCustomField() {
                return customField;
            }
            
            public static CustomClientBuilder builder() {
                return new CustomClientBuilder();
            }
        }
        
        // Create a custom builder that extends the base builder
        class CustomClientBuilder extends SeedBuilderExtensionClientBuilder<CustomClientBuilder> {
            private String customField;
            
            @Override
            protected CustomClientBuilder self() {
                return this;
            }
            
            public CustomClientBuilder customField(String customField) {
                this.customField = customField;
                return self();
            }
            
            @Override
            protected void setEnvironment(ClientOptions.Builder builder) {
                // Example: expand environment variables in URLs
                String url = Environment.DEVELOPMENT.getUrl();
                if (url.contains("${DEV_NAMESPACE}")) {
                    url = url.replace("${DEV_NAMESPACE}", "test-namespace");
                }
                builder.environment(Environment.custom(url));
            }
            
            @Override
            protected void setAdditional(ClientOptions.Builder builder) {
                // Add custom headers
                builder.addHeader("X-Custom-Header", "custom-value");
            }
            
            @Override
            public CustomClient build() {
                validateConfiguration();
                return new CustomClient(buildClientOptions(), customField);
            }
        }
        
        // Test that method chaining works correctly
        CustomClient client = CustomClient.builder()
            .token("test-token")
            .environment(Environment.DEVELOPMENT)  // This should return CustomClientBuilder
            .timeout(30)                          // This should return CustomClientBuilder
            .customField("my-custom-value")       // This should return CustomClientBuilder
            .build();                             // This should return CustomClient
        
        // Verify the custom client was created properly
        assertNotNull(client);
        assertEquals("my-custom-value", client.getCustomField());
        
        SeedBuilderExtensionClient baseClient = SeedBuilderExtensionClient.builder()
            .token("test-token")
            .environment(Environment.PRODUCTION)
            .build();
        
        assertNotNull(baseClient);
    }
}