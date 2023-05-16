package types

import (
	"encoding/json"
	"fmt"
	"os"
)

// IntermediateRepresentation is the input used in a Fern generator.
// This is generated from the Fern compiler and fed into each of the
// configured generators during the code generation process.
type IntermediateRepresentation struct {
	APIName        *Name                       `json:"apiName,omitempty"`
	APIDisplayName string                      `json:"apiDisplayName,omitempty"`
	APIDocs        string                      `json:"apiDocs,omitempty"`
	Auth           *APIAuth                    `json:"auth,omitempty"`
	Types          map[TypeID]*TypeDeclaration `json:"types,omitempty"`

	// Headers []string `json:"headers,omitempty"`
	// Services map[string]string `json:"services,omitempty"`
	// Errors map[string]string `json:"errors,omitempty"`
	// Subpackages map[string]string `json:"subpackages,omitempty"`
	// RootPackage string `json:"rootPackage,omitempty"`
	// Constants []string `json:"constants,omitempty"`
	// Environments []string `json:"environments,omitempty"`
	// BasePath string `json:"basePath,omitempty"`
	// PathParameters string `json:"pathParameters,omitempty"`
	// ErrorDiscriminationStrategy string `json:"errorDiscriminationStrategy,omitempty"`
	// SDKConfig string `json:"sdkConfig,omitempty"`
	// Variables string `json:"variables,omitempty"`
}

// ReadIR reads the *InermediateRepresentation from the given filename.
func ReadIR(irFilename string) (*IntermediateRepresentation, error) {
	bytes, err := os.ReadFile(irFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read intermediate representation: %v", err)
	}
	ir := new(IntermediateRepresentation)
	if err := json.Unmarshal(bytes, ir); err != nil {
		return nil, fmt.Errorf("failed to unmarshal intermediate representation: %v", err)
	}
	return ir, nil
}
