package nameutils

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// Test data structures to match JSON schema
type TestCase struct {
	Input  string         `json:"input"`
	Output ExpectedOutput `json:"output"`
}

type CasedNameTestCase struct {
	Input  CasedNameInput `json:"input"`
	Output ExpectedOutput `json:"output"`
}

type CasedNameInput struct {
	OriginalName       string                   `json:"originalName"`
	CamelCase          *SafeAndUnsafeStringJSON `json:"camelCase"`
	PascalCase         *SafeAndUnsafeStringJSON `json:"pascalCase"`
	SnakeCase          *SafeAndUnsafeStringJSON `json:"snakeCase"`
	ScreamingSnakeCase *SafeAndUnsafeStringJSON `json:"screamingSnakeCase"`
}

type ExpectedOutput struct {
	OriginalName       string                  `json:"originalName"`
	CamelCase          SafeAndUnsafeStringJSON `json:"camelCase"`
	PascalCase         SafeAndUnsafeStringJSON `json:"pascalCase"`
	SnakeCase          SafeAndUnsafeStringJSON `json:"snakeCase"`
	ScreamingSnakeCase SafeAndUnsafeStringJSON `json:"screamingSnakeCase"`
}

type SafeAndUnsafeStringJSON struct {
	UnsafeName string `json:"unsafeName"`
	SafeName   string `json:"safeName"`
}

type TestData struct {
	TestCases          []TestCase          `json:"testCases"`
	CasedNameTestCases []CasedNameTestCase `json:"casedNameTestCases"`
}

func loadTestCases(t *testing.T) TestData {
	// Navigate from test file to repository root
	testFile := filepath.Join("..", "..", "..", "..", "..", "name-utils-test-cases.json")
	
	data, err := os.ReadFile(testFile)
	if err != nil {
		t.Fatalf("Failed to read test cases file: %v", err)
	}
	
	var testData TestData
	err = json.Unmarshal(data, &testData)
	if err != nil {
		t.Fatalf("Failed to parse test cases JSON: %v", err)
	}
	
	return testData
}

func TestExpandNameWithStrings(t *testing.T) {
	testData := loadTestCases(t)
	
	for _, tc := range testData.TestCases {
		t.Run(tc.Input, func(t *testing.T) {
			result := ExpandName(tc.Input)
			expected := tc.Output
			
			// Check all fields
			if result.OriginalName != expected.OriginalName {
				t.Errorf("OriginalName = %q, want %q", result.OriginalName, expected.OriginalName)
			}
			if result.CamelCase.UnsafeName != expected.CamelCase.UnsafeName {
				t.Errorf("CamelCase.UnsafeName = %q, want %q", result.CamelCase.UnsafeName, expected.CamelCase.UnsafeName)
			}
			if result.CamelCase.SafeName != expected.CamelCase.SafeName {
				t.Errorf("CamelCase.SafeName = %q, want %q", result.CamelCase.SafeName, expected.CamelCase.SafeName)
			}
			if result.PascalCase.UnsafeName != expected.PascalCase.UnsafeName {
				t.Errorf("PascalCase.UnsafeName = %q, want %q", result.PascalCase.UnsafeName, expected.PascalCase.UnsafeName)
			}
			if result.PascalCase.SafeName != expected.PascalCase.SafeName {
				t.Errorf("PascalCase.SafeName = %q, want %q", result.PascalCase.SafeName, expected.PascalCase.SafeName)
			}
			if result.SnakeCase.UnsafeName != expected.SnakeCase.UnsafeName {
				t.Errorf("SnakeCase.UnsafeName = %q, want %q", result.SnakeCase.UnsafeName, expected.SnakeCase.UnsafeName)
			}
			if result.SnakeCase.SafeName != expected.SnakeCase.SafeName {
				t.Errorf("SnakeCase.SafeName = %q, want %q", result.SnakeCase.SafeName, expected.SnakeCase.SafeName)
			}
			if result.ScreamingSnakeCase.UnsafeName != expected.ScreamingSnakeCase.UnsafeName {
				t.Errorf("ScreamingSnakeCase.UnsafeName = %q, want %q", result.ScreamingSnakeCase.UnsafeName, expected.ScreamingSnakeCase.UnsafeName)
			}
			if result.ScreamingSnakeCase.SafeName != expected.ScreamingSnakeCase.SafeName {
				t.Errorf("ScreamingSnakeCase.SafeName = %q, want %q", result.ScreamingSnakeCase.SafeName, expected.ScreamingSnakeCase.SafeName)
			}
		})
	}
}

func TestExpandNameWithCasedNames(t *testing.T) {
	testData := loadTestCases(t)
	
	for _, tc := range testData.CasedNameTestCases {
		t.Run(tc.Input.OriginalName, func(t *testing.T) {
			// Convert JSON input to CasedName object
			casedName := &CasedName{
				OriginalName: tc.Input.OriginalName,
			}
			
			if tc.Input.CamelCase != nil {
				casedName.CamelCase = &SafeAndUnsafeString{
					UnsafeName: tc.Input.CamelCase.UnsafeName,
					SafeName:   tc.Input.CamelCase.SafeName,
				}
			}
			if tc.Input.PascalCase != nil {
				casedName.PascalCase = &SafeAndUnsafeString{
					UnsafeName: tc.Input.PascalCase.UnsafeName,
					SafeName:   tc.Input.PascalCase.SafeName,
				}
			}
			if tc.Input.SnakeCase != nil {
				casedName.SnakeCase = &SafeAndUnsafeString{
					UnsafeName: tc.Input.SnakeCase.UnsafeName,
					SafeName:   tc.Input.SnakeCase.SafeName,
				}
			}
			if tc.Input.ScreamingSnakeCase != nil {
				casedName.ScreamingSnakeCase = &SafeAndUnsafeString{
					UnsafeName: tc.Input.ScreamingSnakeCase.UnsafeName,
					SafeName:   tc.Input.ScreamingSnakeCase.SafeName,
				}
			}
			
			result := ExpandName(casedName)
			expected := tc.Output
			
			// Check all fields
			if result.OriginalName != expected.OriginalName {
				t.Errorf("OriginalName = %q, want %q", result.OriginalName, expected.OriginalName)
			}
			if result.CamelCase.UnsafeName != expected.CamelCase.UnsafeName {
				t.Errorf("CamelCase.UnsafeName = %q, want %q", result.CamelCase.UnsafeName, expected.CamelCase.UnsafeName)
			}
			if result.CamelCase.SafeName != expected.CamelCase.SafeName {
				t.Errorf("CamelCase.SafeName = %q, want %q", result.CamelCase.SafeName, expected.CamelCase.SafeName)
			}
			if result.PascalCase.UnsafeName != expected.PascalCase.UnsafeName {
				t.Errorf("PascalCase.UnsafeName = %q, want %q", result.PascalCase.UnsafeName, expected.PascalCase.UnsafeName)
			}
			if result.PascalCase.SafeName != expected.PascalCase.SafeName {
				t.Errorf("PascalCase.SafeName = %q, want %q", result.PascalCase.SafeName, expected.PascalCase.SafeName)
			}
			if result.SnakeCase.UnsafeName != expected.SnakeCase.UnsafeName {
				t.Errorf("SnakeCase.UnsafeName = %q, want %q", result.SnakeCase.UnsafeName, expected.SnakeCase.UnsafeName)
			}
			if result.SnakeCase.SafeName != expected.SnakeCase.SafeName {
				t.Errorf("SnakeCase.SafeName = %q, want %q", result.SnakeCase.SafeName, expected.SnakeCase.SafeName)
			}
			if result.ScreamingSnakeCase.UnsafeName != expected.ScreamingSnakeCase.UnsafeName {
				t.Errorf("ScreamingSnakeCase.UnsafeName = %q, want %q", result.ScreamingSnakeCase.UnsafeName, expected.ScreamingSnakeCase.UnsafeName)
			}
			if result.ScreamingSnakeCase.SafeName != expected.ScreamingSnakeCase.SafeName {
				t.Errorf("ScreamingSnakeCase.SafeName = %q, want %q", result.ScreamingSnakeCase.SafeName, expected.ScreamingSnakeCase.SafeName)
			}
		})
	}
}