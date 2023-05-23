package ir

type HttpPathPart struct {
	PathParameter string `json:"pathParameter"`
	Tail          string `json:"tail"`
}
