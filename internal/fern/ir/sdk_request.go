package ir

type SdkRequest struct {
	RequestParameterName *Name            `json:"requestParameterName"`
	Shape                *SdkRequestShape `json:"shape"`
}
