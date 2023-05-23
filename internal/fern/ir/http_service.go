package ir

type HttpService struct {
	Availability   *Availability        `json:"availability"`
	Name           *DeclaredServiceName `json:"name"`
	DisplayName    *string              `json:"displayName"`
	BasePath       *HttpPath            `json:"basePath"`
	Endpoints      []*HttpEndpoint      `json:"endpoints"`
	Headers        []*HttpHeader        `json:"headers"`
	PathParameters []*PathParameter     `json:"pathParameters"`
}
