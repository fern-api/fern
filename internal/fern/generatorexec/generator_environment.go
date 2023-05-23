package generatorexec

import (
	json "encoding/json"
	fmt "fmt"
)

type GeneratorEnvironment struct {
	Type   string
	Local  any
	Remote *RemoteGeneratorEnvironment
}

func (x *GeneratorEnvironment) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "local":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Local = value
	case "remote":
		value := new(RemoteGeneratorEnvironment)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Remote = value
	}
	return nil
}

type GeneratorEnvironmentVisitor interface {
	VisitLocal(any) error
	VisitRemote(*RemoteGeneratorEnvironment) error
}

func (x *GeneratorEnvironment) Accept(v GeneratorEnvironmentVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "local":
		return v.VisitLocal(x.Local)
	case "remote":
		return v.VisitRemote(x.Remote)
	}
}
