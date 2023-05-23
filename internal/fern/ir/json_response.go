package ir

type JsonResponse struct {
	Docs             *string        `json:"docs"`
	ResponseBodyType *TypeReference `json:"responseBodyType"`
}
