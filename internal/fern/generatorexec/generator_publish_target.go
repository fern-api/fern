package generatorexec

import (
	json "encoding/json"
	fmt "fmt"
)

type GeneratorPublishTarget struct {
	Type    string
	Maven   *MavenRegistryConfigV2
	Npm     *NpmRegistryConfigV2
	Pypi    *PypiRegistryConfig
	Postman *PostmanConfig
}

func (x *GeneratorPublishTarget) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "maven":
		value := new(MavenRegistryConfigV2)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Maven = value
	case "npm":
		value := new(NpmRegistryConfigV2)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Npm = value
	case "pypi":
		value := new(PypiRegistryConfig)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Pypi = value
	case "postman":
		value := new(PostmanConfig)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Postman = value
	}
	return nil
}

type GeneratorPublishTargetVisitor interface {
	VisitMaven(*MavenRegistryConfigV2) error
	VisitNpm(*NpmRegistryConfigV2) error
	VisitPypi(*PypiRegistryConfig) error
	VisitPostman(*PostmanConfig) error
}

func (x *GeneratorPublishTarget) Accept(v GeneratorPublishTargetVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "maven":
		return v.VisitMaven(x.Maven)
	case "npm":
		return v.VisitNpm(x.Npm)
	case "pypi":
		return v.VisitPypi(x.Pypi)
	case "postman":
		return v.VisitPostman(x.Postman)
	}
}
