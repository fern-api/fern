package ir

type SdkConfig struct {
	IsAuthMandatory       bool             `json:"isAuthMandatory"`
	HasStreamingEndpoints bool             `json:"hasStreamingEndpoints"`
	PlatformHeaders       *PlatformHeaders `json:"platformHeaders"`
}
