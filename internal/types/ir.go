package types

// IntermediateRepresentation is the input used in a Fern generator.
// This is generated from the Fern compiler and fed into each of the
// configured generators during the code generation process.
type IntermediateRepresentation struct {
	APIName        string `json:"apiName,omitempty"`
	APIDisplayName string `json:"apiDisplayName,omitempty"`
	APIDocs        string `json:"apiDocs,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  auth.ApiAuth
	Auth string `json:"auth,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  list<http.HttpHeader>
	Headers []string `json:"headers,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  map<commons.TypeId, types.TypeDeclaration>
	Types map[string]string `json:"types,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  map<commons.ServiceId, http.HttpService>
	Services map[string]string `json:"services,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  map<commons.ErrorId, errors.ErrorDeclaration>
	Errors map[string]string `json:"errors,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  map<commons.SubpackageId, Subpackage>
	Subpackages map[string]string `json:"subpackages,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  Package
	RootPackage string `json:"rootPackage,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  constants.Constants
	Constants []string `json:"constants,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  optional<environment.EnvironmentsConfig>
	Environments []string `json:"environments,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  optional<http.HttpPath>
	BasePath string `json:"basePath,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  list<http.PathParameter>
	PathParameters string `json:"pathParameters,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  ErrorDiscriminationStrategy
	ErrorDiscriminationStrategy string `json:"errorDiscriminationStrategy,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  SdkConfig
	SDKConfig string `json:"sdkConfig,omitempty"`

	// TODO: Use a structured type or enum here.
	//
	//  list<variables.VariableDeclaration>
	Variables string `json:"variables,omitempty"`
}
