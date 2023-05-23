package ir

type IntermediateRepresentation struct {
	ApiName                     *Name                         `json:"apiName"`
	ApiDisplayName              *string                       `json:"apiDisplayName"`
	ApiDocs                     *string                       `json:"apiDocs"`
	Auth                        *ApiAuth                      `json:"auth"`
	Headers                     []*HttpHeader                 `json:"headers"`
	Types                       map[TypeId]*TypeDeclaration   `json:"types"`
	Services                    map[ServiceId]*HttpService    `json:"services"`
	Errors                      map[ErrorId]*ErrorDeclaration `json:"errors"`
	Subpackages                 map[SubpackageId]*Subpackage  `json:"subpackages"`
	RootPackage                 *Package                      `json:"rootPackage"`
	Constants                   *Constants                    `json:"constants"`
	Environments                *EnvironmentsConfig           `json:"environments"`
	BasePath                    *HttpPath                     `json:"basePath"`
	PathParameters              []*PathParameter              `json:"pathParameters"`
	ErrorDiscriminationStrategy *ErrorDiscriminationStrategy  `json:"errorDiscriminationStrategy"`
	SdkConfig                   *SdkConfig                    `json:"sdkConfig"`
	Variables                   []*VariableDeclaration        `json:"variables"`
}
