package mockwire

type Request struct {
	URL             string
	Method          string
	Headers         map[string]string
	BodyProperties  map[string]interface{}
	QueryParameters map[string]string
	PathParameters  map[string]string
	Auth            bool
	Token           string
	Fields          map[string]interface{}
}

type Response struct {
	Body   interface{}
	Status int64
}

type TestCase struct {
	Request  *Request
	Response *Response
}

type Stub struct {
	URL      string
	Shutdown func()
}
