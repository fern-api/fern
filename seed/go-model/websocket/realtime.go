// Code generated by Fern. DO NOT EDIT.

package websocket

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/websocket/fern/internal"
)

type SendEvent struct {
	SendText  string `json:"sendText" url:"sendText"`
	SendParam int    `json:"sendParam" url:"sendParam"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *SendEvent) GetSendText() string {
	if s == nil {
		return ""
	}
	return s.SendText
}

func (s *SendEvent) GetSendParam() int {
	if s == nil {
		return 0
	}
	return s.SendParam
}

func (s *SendEvent) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *SendEvent) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler SendEvent
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = SendEvent(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *SendEvent) String() string {
	if len(s.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(s.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(s); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", s)
}

type SendSnakeCase struct {
	SendText  string `json:"send_text" url:"send_text"`
	SendParam int    `json:"send_param" url:"send_param"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *SendSnakeCase) GetSendText() string {
	if s == nil {
		return ""
	}
	return s.SendText
}

func (s *SendSnakeCase) GetSendParam() int {
	if s == nil {
		return 0
	}
	return s.SendParam
}

func (s *SendSnakeCase) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *SendSnakeCase) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler SendSnakeCase
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = SendSnakeCase(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *SendSnakeCase) String() string {
	if len(s.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(s.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(s); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", s)
}

type ReceiveEvent struct {
	Alpha string `json:"alpha" url:"alpha"`
	Beta  int    `json:"beta" url:"beta"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (r *ReceiveEvent) GetAlpha() string {
	if r == nil {
		return ""
	}
	return r.Alpha
}

func (r *ReceiveEvent) GetBeta() int {
	if r == nil {
		return 0
	}
	return r.Beta
}

func (r *ReceiveEvent) GetExtraProperties() map[string]any {
	if r == nil {
		return nil
	}
	return r.extraProperties
}

func (r *ReceiveEvent) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler ReceiveEvent
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*r = ReceiveEvent(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *r)
	if err != nil {
		return err
	}
	r.extraProperties = extraProperties
	r.rawJSON = json.RawMessage(data)
	return nil
}

func (r *ReceiveEvent) String() string {
	if len(r.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(r.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(r); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", r)
}

type ReceiveSnakeCase struct {
	ReceiveText string `json:"receive_text" url:"receive_text"`
	ReceiveInt  int    `json:"receive_int" url:"receive_int"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (r *ReceiveSnakeCase) GetReceiveText() string {
	if r == nil {
		return ""
	}
	return r.ReceiveText
}

func (r *ReceiveSnakeCase) GetReceiveInt() int {
	if r == nil {
		return 0
	}
	return r.ReceiveInt
}

func (r *ReceiveSnakeCase) GetExtraProperties() map[string]any {
	if r == nil {
		return nil
	}
	return r.extraProperties
}

func (r *ReceiveSnakeCase) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler ReceiveSnakeCase
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*r = ReceiveSnakeCase(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *r)
	if err != nil {
		return err
	}
	r.extraProperties = extraProperties
	r.rawJSON = json.RawMessage(data)
	return nil
}

func (r *ReceiveSnakeCase) String() string {
	if len(r.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(r.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(r); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", r)
}

type SendEvent2 struct {
	SendText2  string `json:"sendText2" url:"sendText2"`
	SendParam2 bool   `json:"sendParam2" url:"sendParam2"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *SendEvent2) GetSendText2() string {
	if s == nil {
		return ""
	}
	return s.SendText2
}

func (s *SendEvent2) GetSendParam2() bool {
	if s == nil {
		return false
	}
	return s.SendParam2
}

func (s *SendEvent2) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *SendEvent2) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler SendEvent2
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = SendEvent2(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *SendEvent2) String() string {
	if len(s.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(s.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(s); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", s)
}

type ReceiveEvent2 struct {
	Gamma   string `json:"gamma" url:"gamma"`
	Delta   int    `json:"delta" url:"delta"`
	Epsilon bool   `json:"epsilon" url:"epsilon"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (r *ReceiveEvent2) GetGamma() string {
	if r == nil {
		return ""
	}
	return r.Gamma
}

func (r *ReceiveEvent2) GetDelta() int {
	if r == nil {
		return 0
	}
	return r.Delta
}

func (r *ReceiveEvent2) GetEpsilon() bool {
	if r == nil {
		return false
	}
	return r.Epsilon
}

func (r *ReceiveEvent2) GetExtraProperties() map[string]any {
	if r == nil {
		return nil
	}
	return r.extraProperties
}

func (r *ReceiveEvent2) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler ReceiveEvent2
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*r = ReceiveEvent2(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *r)
	if err != nil {
		return err
	}
	r.extraProperties = extraProperties
	r.rawJSON = json.RawMessage(data)
	return nil
}

func (r *ReceiveEvent2) String() string {
	if len(r.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(r.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(r); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", r)
}

type ReceiveEvent3 struct {
	ReceiveText3 string `json:"receiveText3" url:"receiveText3"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (r *ReceiveEvent3) GetReceiveText3() string {
	if r == nil {
		return ""
	}
	return r.ReceiveText3
}

func (r *ReceiveEvent3) GetExtraProperties() map[string]any {
	if r == nil {
		return nil
	}
	return r.extraProperties
}

func (r *ReceiveEvent3) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler ReceiveEvent3
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*r = ReceiveEvent3(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *r)
	if err != nil {
		return err
	}
	r.extraProperties = extraProperties
	r.rawJSON = json.RawMessage(data)
	return nil
}

func (r *ReceiveEvent3) String() string {
	if len(r.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(r.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(r); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", r)
}
