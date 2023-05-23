package ir

type EnvironmentsConfig struct {
	DefaultEnvironment *EnvironmentId `json:"defaultEnvironment"`
	Environments       *Environments  `json:"environments"`
}
