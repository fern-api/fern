package generatorexec

import (
	json "encoding/json"
	fmt "fmt"
)

type PackageCoordinate struct {
	Type  string
	Npm   *NpmCoordinate
	Maven *MavenCoordinate
}

func (x *PackageCoordinate) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "npm":
		value := new(NpmCoordinate)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Npm = value
	case "maven":
		value := new(MavenCoordinate)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Maven = value
	}
	return nil
}

type PackageCoordinateVisitor interface {
	VisitNpm(*NpmCoordinate) error
	VisitMaven(*MavenCoordinate) error
}

func (x *PackageCoordinate) Accept(v PackageCoordinateVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "npm":
		return v.VisitNpm(x.Npm)
	case "maven":
		return v.VisitMaven(x.Maven)
	}
}
