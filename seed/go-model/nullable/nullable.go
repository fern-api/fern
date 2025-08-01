// Code generated by Fern. DO NOT EDIT.

package nullable

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/nullable/fern/internal"
	time "time"
)

type Email = *string

type UserId = string

type WeirdNumber struct {
	Integer                int
	DoubleOptional         *float64
	StringOptionalOptional *string
	Double                 float64
}

type User struct {
	Name           string         `json:"name" url:"name"`
	Id             UserId         `json:"id" url:"id"`
	Tags           []string       `json:"tags" url:"tags"`
	Metadata       *Metadata      `json:"metadata,omitempty" url:"metadata,omitempty"`
	Email          Email          `json:"email" url:"email"`
	FavoriteNumber *WeirdNumber   `json:"favorite-number" url:"favorite-number"`
	Numbers        []int          `json:"numbers,omitempty" url:"numbers,omitempty"`
	Strings        map[string]any `json:"strings,omitempty" url:"strings,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (u *User) GetName() string {
	if u == nil {
		return ""
	}
	return u.Name
}

func (u *User) GetId() UserId {
	if u == nil {
		return ""
	}
	return u.Id
}

func (u *User) GetTags() []string {
	if u == nil {
		return nil
	}
	return u.Tags
}

func (u *User) GetMetadata() *Metadata {
	if u == nil {
		return nil
	}
	return u.Metadata
}

func (u *User) GetEmail() Email {
	if u == nil {
		return nil
	}
	return u.Email
}

func (u *User) GetFavoriteNumber() *WeirdNumber {
	if u == nil {
		return nil
	}
	return u.FavoriteNumber
}

func (u *User) GetNumbers() []int {
	if u == nil {
		return nil
	}
	return u.Numbers
}

func (u *User) GetStrings() map[string]any {
	if u == nil {
		return nil
	}
	return u.Strings
}

func (u *User) GetExtraProperties() map[string]any {
	if u == nil {
		return nil
	}
	return u.extraProperties
}

func (u *User) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler User
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*u = User(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *u)
	if err != nil {
		return err
	}
	u.extraProperties = extraProperties
	u.rawJSON = json.RawMessage(data)
	return nil
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

type Status struct {
	Type        string
	Active      any
	Archived    *time.Time
	SoftDeleted *time.Time
}

type Metadata struct {
	CreatedAt time.Time          `json:"createdAt" url:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" url:"updatedAt"`
	Avatar    *string            `json:"avatar" url:"avatar"`
	Activated *bool              `json:"activated,omitempty" url:"activated,omitempty"`
	Status    *Status            `json:"status" url:"status"`
	Values    map[string]*string `json:"values,omitempty" url:"values,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (m *Metadata) GetCreatedAt() time.Time {
	if m == nil {
		return time.Time{}
	}
	return m.CreatedAt
}

func (m *Metadata) GetUpdatedAt() time.Time {
	if m == nil {
		return time.Time{}
	}
	return m.UpdatedAt
}

func (m *Metadata) GetAvatar() *string {
	if m == nil {
		return nil
	}
	return m.Avatar
}

func (m *Metadata) GetActivated() *bool {
	if m == nil {
		return nil
	}
	return m.Activated
}

func (m *Metadata) GetStatus() *Status {
	if m == nil {
		return nil
	}
	return m.Status
}

func (m *Metadata) GetValues() map[string]*string {
	if m == nil {
		return nil
	}
	return m.Values
}

func (m *Metadata) GetExtraProperties() map[string]any {
	if m == nil {
		return nil
	}
	return m.extraProperties
}

func (m *Metadata) UnmarshalJSON(
	data []byte,
) error {
	type embed Metadata
	var unmarshaler = struct {
		embed
		CreatedAt *internal.DateTime `json:"createdAt"`
		UpdatedAt *internal.DateTime `json:"updatedAt"`
	}{
		embed: embed(*m),
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	*m = Metadata(unmarshaler.embed)
	m.CreatedAt = unmarshaler.CreatedAt.Time()
	m.UpdatedAt = unmarshaler.UpdatedAt.Time()
	extraProperties, err := internal.ExtractExtraProperties(data, *m)
	if err != nil {
		return err
	}
	m.extraProperties = extraProperties
	m.rawJSON = json.RawMessage(data)
	return nil
}

func (m *Metadata) MarshalJSON() ([]byte, error) {
	type embed Metadata
	var marshaler = struct {
		embed
		CreatedAt *internal.DateTime `json:"createdAt"`
		UpdatedAt *internal.DateTime `json:"updatedAt"`
	}{
		embed:     embed(*m),
		CreatedAt: internal.NewDateTime(m.CreatedAt),
		UpdatedAt: internal.NewDateTime(m.UpdatedAt),
	}
	return json.Marshal(marshaler)
}

func (m *Metadata) String() string {
	if len(m.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(m.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(m); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", m)
}
