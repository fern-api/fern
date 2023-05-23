package generatorexec

import (
	json "encoding/json"
	fmt "fmt"
)

type OutputMode struct {
	Type          string
	Publish       *GeneratorPublishConfig
	DownloadFiles any
	Github        *GithubOutputMode
}

func (x *OutputMode) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "publish":
		value := new(GeneratorPublishConfig)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Publish = value
	case "downloadFiles":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.DownloadFiles = value
	case "github":
		value := new(GithubOutputMode)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Github = value
	}
	return nil
}

type OutputModeVisitor interface {
	VisitPublish(*GeneratorPublishConfig) error
	VisitDownloadFiles(any) error
	VisitGithub(*GithubOutputMode) error
}

func (x *OutputMode) Accept(v OutputModeVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "publish":
		return v.VisitPublish(x.Publish)
	case "downloadFiles":
		return v.VisitDownloadFiles(x.DownloadFiles)
	case "github":
		return v.VisitGithub(x.Github)
	}
}
