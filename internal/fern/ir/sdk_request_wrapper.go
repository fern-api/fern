package ir

type SdkRequestWrapper struct {
	WrapperName *Name `json:"wrapperName"`
	BodyKey     *Name `json:"bodyKey"`
}
