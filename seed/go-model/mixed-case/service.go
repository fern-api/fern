// Code generated by Fern. DO NOT EDIT.

package mixedcase

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/mixed-case/fern/internal"
)

type Organization struct {
	Name string `json:"name" url:"name"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (o *Organization) GetName() string {
	if o == nil {
		return ""
	}
	return o.Name
}

func (o *Organization) GetExtraProperties() map[string]any {
	if o == nil {
		return nil
	}
	return o.extraProperties
}

func (o *Organization) String() string {
	if len(o.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(o.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(o); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", o)
}

type User struct {
	UserName        string            `json:"userName" url:"userName"`
	MetadataTags    []string          `json:"metadata_tags" url:"metadata_tags"`
	ExtraProperties map[string]string `json:"EXTRA_PROPERTIES" url:"EXTRA_PROPERTIES"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (u *User) GetUserName() string {
	if u == nil {
		return ""
	}
	return u.UserName
}

func (u *User) GetMetadataTags() []string {
	if u == nil {
		return nil
	}
	return u.MetadataTags
}

func (u *User) GetExtraProperties() map[string]string {
	if u == nil {
		return nil
	}
	return u.ExtraProperties
}

func (u *User) GetExtraProperties() map[string]any {
	if u == nil {
		return nil
	}
	return u.extraProperties
}

func (u *User) String() string {
	if len(u.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(u.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(u); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", u)
}

type NestedUser struct {
	Name       string `json:"Name" url:"Name"`
	NestedUser *User  `json:"NestedUser" url:"NestedUser"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (n *NestedUser) GetName() string {
	if n == nil {
		return ""
	}
	return n.Name
}

func (n *NestedUser) GetNestedUser() *User {
	if n == nil {
		return nil
	}
	return n.NestedUser
}

func (n *NestedUser) GetExtraProperties() map[string]any {
	if n == nil {
		return nil
	}
	return n.extraProperties
}

func (n *NestedUser) String() string {
	if len(n.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(n.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(n); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", n)
}

type ResourceStatus string

const (
	ResourceStatusActive   = "ACTIVE"
	ResourceStatusInactive = "INACTIVE"
)

func NewResourceStatusFromString(s string) (ResourceStatus, error) {
	switch s {
	case "ACTIVE":
		return ResourceStatusActive, nil
	case "INACTIVE":
		return ResourceStatusInactive, nil
	}
	var t ResourceStatus
	return "", fmt.Errorf("%s is not a valid %T", s, t)
}

func (r ResourceStatus) Ptr() *ResourceStatus {
	return &r
}

type Resource struct {
	ResourceType string
	Status       *ResourceStatus
	User         User
	Organization Organization
}
