package com.fern.java;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class NameUtilsTest {
    
    private static TestData testData;
    
    // Test data classes to match JSON schema
    static class TestData {
        @JsonProperty("testCases")
        public List<TestCase> testCases;
        
        @JsonProperty("casedNameTestCases")
        public List<CasedNameTestCase> casedNameTestCases;
    }
    
    static class TestCase {
        @JsonProperty("input")
        public String input;
        
        @JsonProperty("output")
        public ExpectedOutput output;
    }
    
    static class CasedNameTestCase {
        @JsonProperty("input")
        public CasedNameInput input;
        
        @JsonProperty("output")
        public ExpectedOutput output;
    }
    
    static class CasedNameInput {
        @JsonProperty("originalName")
        public String originalName;
        
        @JsonProperty("camelCase")
        public SafeAndUnsafeStringJSON camelCase;
        
        @JsonProperty("pascalCase")
        public SafeAndUnsafeStringJSON pascalCase;
        
        @JsonProperty("snakeCase")
        public SafeAndUnsafeStringJSON snakeCase;
        
        @JsonProperty("screamingSnakeCase")
        public SafeAndUnsafeStringJSON screamingSnakeCase;
    }
    
    static class ExpectedOutput {
        @JsonProperty("originalName")
        public String originalName;
        
        @JsonProperty("camelCase")
        public SafeAndUnsafeStringJSON camelCase;
        
        @JsonProperty("pascalCase")
        public SafeAndUnsafeStringJSON pascalCase;
        
        @JsonProperty("snakeCase")
        public SafeAndUnsafeStringJSON snakeCase;
        
        @JsonProperty("screamingSnakeCase")
        public SafeAndUnsafeStringJSON screamingSnakeCase;
    }
    
    static class SafeAndUnsafeStringJSON {
        @JsonProperty("unsafeName")
        public String unsafeName;
        
        @JsonProperty("safeName")
        public String safeName;
    }
    
    @BeforeClass
    public static void loadTestCases() throws IOException {
        // Navigate from test file to repository root
        File testFile = new File("../../../../../name-utils-test-cases.json");
        ObjectMapper mapper = new ObjectMapper();
        testData = mapper.readValue(testFile, TestData.class);
    }
    
    @Test
    public void testExpandNameWithStrings() {
        for (TestCase tc : testData.testCases) {
            NameUtils.ExpandedName result = NameUtils.expandName(tc.input);
            ExpectedOutput expected = tc.output;
            
            // Check all fields
            assertEquals("OriginalName for input: " + tc.input, 
                expected.originalName, result.getOriginalName());
            assertEquals("CamelCase.UnsafeName for input: " + tc.input, 
                expected.camelCase.unsafeName, result.getCamelCase().getUnsafeName());
            assertEquals("CamelCase.SafeName for input: " + tc.input, 
                expected.camelCase.safeName, result.getCamelCase().getSafeName());
            assertEquals("PascalCase.UnsafeName for input: " + tc.input, 
                expected.pascalCase.unsafeName, result.getPascalCase().getUnsafeName());
            assertEquals("PascalCase.SafeName for input: " + tc.input, 
                expected.pascalCase.safeName, result.getPascalCase().getSafeName());
            assertEquals("SnakeCase.UnsafeName for input: " + tc.input, 
                expected.snakeCase.unsafeName, result.getSnakeCase().getUnsafeName());
            assertEquals("SnakeCase.SafeName for input: " + tc.input, 
                expected.snakeCase.safeName, result.getSnakeCase().getSafeName());
            assertEquals("ScreamingSnakeCase.UnsafeName for input: " + tc.input, 
                expected.screamingSnakeCase.unsafeName, result.getScreamingSnakeCase().getUnsafeName());
            assertEquals("ScreamingSnakeCase.SafeName for input: " + tc.input, 
                expected.screamingSnakeCase.safeName, result.getScreamingSnakeCase().getSafeName());
        }
    }
    
    @Test
    public void testExpandNameWithCasedNames() {
        for (CasedNameTestCase tc : testData.casedNameTestCases) {
            // Convert JSON input to CasedName object
            NameUtils.CasedName casedName = new NameUtils.CasedName(
                tc.input.originalName,
                tc.input.camelCase != null ? 
                    Optional.of(new NameUtils.SafeAndUnsafeString(
                        tc.input.camelCase.unsafeName,
                        tc.input.camelCase.safeName
                    )) : Optional.empty(),
                tc.input.pascalCase != null ?
                    Optional.of(new NameUtils.SafeAndUnsafeString(
                        tc.input.pascalCase.unsafeName,
                        tc.input.pascalCase.safeName
                    )) : Optional.empty(),
                tc.input.snakeCase != null ?
                    Optional.of(new NameUtils.SafeAndUnsafeString(
                        tc.input.snakeCase.unsafeName,
                        tc.input.snakeCase.safeName
                    )) : Optional.empty(),
                tc.input.screamingSnakeCase != null ?
                    Optional.of(new NameUtils.SafeAndUnsafeString(
                        tc.input.screamingSnakeCase.unsafeName,
                        tc.input.screamingSnakeCase.safeName
                    )) : Optional.empty()
            );
            
            NameUtils.ExpandedName result = NameUtils.expandName(casedName);
            ExpectedOutput expected = tc.output;
            
            // Check all fields
            assertEquals("OriginalName for input: " + tc.input.originalName,
                expected.originalName, result.getOriginalName());
            assertEquals("CamelCase.UnsafeName for input: " + tc.input.originalName,
                expected.camelCase.unsafeName, result.getCamelCase().getUnsafeName());
            assertEquals("CamelCase.SafeName for input: " + tc.input.originalName,
                expected.camelCase.safeName, result.getCamelCase().getSafeName());
            assertEquals("PascalCase.UnsafeName for input: " + tc.input.originalName,
                expected.pascalCase.unsafeName, result.getPascalCase().getUnsafeName());
            assertEquals("PascalCase.SafeName for input: " + tc.input.originalName,
                expected.pascalCase.safeName, result.getPascalCase().getSafeName());
            assertEquals("SnakeCase.UnsafeName for input: " + tc.input.originalName,
                expected.snakeCase.unsafeName, result.getSnakeCase().getUnsafeName());
            assertEquals("SnakeCase.SafeName for input: " + tc.input.originalName,
                expected.snakeCase.safeName, result.getSnakeCase().getSafeName());
            assertEquals("ScreamingSnakeCase.UnsafeName for input: " + tc.input.originalName,
                expected.screamingSnakeCase.unsafeName, result.getScreamingSnakeCase().getUnsafeName());
            assertEquals("ScreamingSnakeCase.SafeName for input: " + tc.input.originalName,
                expected.screamingSnakeCase.safeName, result.getScreamingSnakeCase().getSafeName());
        }
    }
}