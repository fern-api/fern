package com.seed.clientSideParams;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class TestResources {

    private TestResources() {
        // Utility class
    }

    /**
     * Loads a resource file from the classpath and returns its contents as a String.
     * @param path the resource path (e.g., "/wire-tests/MyTest_testMethod_request.json")
     * @return the contents of the resource file
     * @throws RuntimeException if the resource cannot be found or read
     */
    public static String loadResource(String path) {
        try (InputStream is = TestResources.class.getResourceAsStream(path)) {
            if (is == null) {
                throw new RuntimeException("Resource not found: " + path);
            }
            ByteArrayOutputStream result = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int length;
            while ((length = is.read(buffer)) != -1) {
                result.write(buffer, 0, length);
            }
            return result.toString(StandardCharsets.UTF_8.name());
        } catch (IOException e) {
            throw new RuntimeException("Failed to load resource: " + path, e);
        }
    }
}
