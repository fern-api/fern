// Code generated by Fern. DO NOT EDIT.

package literal

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/literal/fern/internal"
)

type SendRequest struct {
	Query           string           `json:"query" url:"query"`
	Context         SomeLiteral      `json:"context" url:"context"`
	MaybeContext    *SomeLiteral     `json:"maybeContext,omitempty" url:"maybeContext,omitempty"`
	ContainerObject *ContainerObject `json:"containerObject" url:"containerObject"`

	prompt          string
	stream          bool
	ending          string
	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *SendRequest) GetPrompt() string {
	if s == nil {
		return ""
	}
	return s.prompt
}

func (s *SendRequest) GetQuery() string {
	if s == nil {
		return ""
	}
	return s.Query
}

func (s *SendRequest) GetStream() bool {
	if s == nil {
		return false
	}
	return s.stream
}

func (s *SendRequest) GetEnding() string {
	if s == nil {
		return ""
	}
	return s.ending
}

func (s *SendRequest) GetContext() SomeLiteral {
	if s == nil {
		return ""
	}
	return s.Context
}

func (s *SendRequest) GetMaybeContext() *SomeLiteral {
	if s == nil {
		return nil
	}
	return s.MaybeContext
}

func (s *SendRequest) GetContainerObject() *ContainerObject {
	if s == nil {
		return nil
	}
	return s.ContainerObject
}

func (s *SendRequest) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *SendRequest) String() string {
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

type ContainerObject struct {
	NestedObjects []*NestedObjectWithLiterals `json:"nestedObjects" url:"nestedObjects"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (c *ContainerObject) GetNestedObjects() []*NestedObjectWithLiterals {
	if c == nil {
		return nil
	}
	return c.NestedObjects
}

func (c *ContainerObject) GetExtraProperties() map[string]any {
	if c == nil {
		return nil
	}
	return c.extraProperties
}

func (c *ContainerObject) String() string {
	if len(c.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(c.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(c); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", c)
}

type NestedObjectWithLiterals struct {
	StrProp string `json:"strProp" url:"strProp"`

	literal1        string
	literal2        string
	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (n *NestedObjectWithLiterals) GetLiteral1() string {
	if n == nil {
		return ""
	}
	return n.literal1
}

func (n *NestedObjectWithLiterals) GetLiteral2() string {
	if n == nil {
		return ""
	}
	return n.literal2
}

func (n *NestedObjectWithLiterals) GetStrProp() string {
	if n == nil {
		return ""
	}
	return n.StrProp
}

func (n *NestedObjectWithLiterals) GetExtraProperties() map[string]any {
	if n == nil {
		return nil
	}
	return n.extraProperties
}

func (n *NestedObjectWithLiterals) String() string {
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

type SomeLiteral = string
