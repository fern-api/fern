package ir

type HttpEndpoint struct {
	Docs              *string                `json:"docs"`
	Availability      *Availability          `json:"availability"`
	Name              EndpointName           `json:"name"`
	DisplayName       *string                `json:"displayName"`
	Method            HttpMethod             `json:"method"`
	Headers           []*HttpHeader          `json:"headers"`
	BaseUrl           *EnvironmentBaseUrlId  `json:"baseUrl"`
	Path              *HttpPath              `json:"path"`
	FullPath          *HttpPath              `json:"fullPath"`
	PathParameters    []*PathParameter       `json:"pathParameters"`
	AllPathParameters []*PathParameter       `json:"allPathParameters"`
	QueryParameters   []*QueryParameter      `json:"queryParameters"`
	RequestBody       *HttpRequestBody       `json:"requestBody"`
	SdkRequest        *SdkRequest            `json:"sdkRequest"`
	Response          *HttpResponse          `json:"response"`
	StreamingResponse *StreamingResponse     `json:"streamingResponse"`
	SdkResponse       *SdkResponse           `json:"sdkResponse"`
	Errors            ResponseErrors         `json:"errors"`
	Auth              bool                   `json:"auth"`
	Examples          []*ExampleEndpointCall `json:"examples"`
}
