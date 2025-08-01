// Code generated by Fern. DO NOT EDIT.

package pagination

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/pagination/fern/internal"
)

type SearchRequestQuery struct {
	SingleFilterSearchRequest   *SingleFilterSearchRequest
	MultipleFilterSearchRequest *MultipleFilterSearchRequest
}

type MultipleFilterSearchRequest struct {
	Operator *MultipleFilterSearchRequestOperator `json:"operator,omitempty" url:"operator,omitempty"`
	Value    *MultipleFilterSearchRequestValue    `json:"value,omitempty" url:"value,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (m *MultipleFilterSearchRequest) GetOperator() *MultipleFilterSearchRequestOperator {
	if m == nil {
		return nil
	}
	return m.Operator
}

func (m *MultipleFilterSearchRequest) GetValue() *MultipleFilterSearchRequestValue {
	if m == nil {
		return nil
	}
	return m.Value
}

func (m *MultipleFilterSearchRequest) GetExtraProperties() map[string]any {
	if m == nil {
		return nil
	}
	return m.extraProperties
}

func (m *MultipleFilterSearchRequest) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler MultipleFilterSearchRequest
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*m = MultipleFilterSearchRequest(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *m)
	if err != nil {
		return err
	}
	m.extraProperties = extraProperties
	m.rawJSON = json.RawMessage(data)
	return nil
}

func (m *MultipleFilterSearchRequest) String() string {
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

type MultipleFilterSearchRequestOperator string

const (
	MultipleFilterSearchRequestOperatorAnd = "AND"
	MultipleFilterSearchRequestOperatorOr  = "OR"
)

func NewMultipleFilterSearchRequestOperatorFromString(s string) (MultipleFilterSearchRequestOperator, error) {
	switch s {
	case "AND":
		return MultipleFilterSearchRequestOperatorAnd, nil
	case "OR":
		return MultipleFilterSearchRequestOperatorOr, nil
	}
	var t MultipleFilterSearchRequestOperator
	return "", fmt.Errorf("%s is not a valid %T", s, t)
}

func (m MultipleFilterSearchRequestOperator) Ptr() *MultipleFilterSearchRequestOperator {
	return &m
}

type MultipleFilterSearchRequestValue struct {
	MultipleFilterSearchRequestList []*MultipleFilterSearchRequest
	SingleFilterSearchRequestList   []*SingleFilterSearchRequest
}

type SingleFilterSearchRequest struct {
	Field    *string                            `json:"field,omitempty" url:"field,omitempty"`
	Operator *SingleFilterSearchRequestOperator `json:"operator,omitempty" url:"operator,omitempty"`
	Value    *string                            `json:"value,omitempty" url:"value,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *SingleFilterSearchRequest) GetField() *string {
	if s == nil {
		return nil
	}
	return s.Field
}

func (s *SingleFilterSearchRequest) GetOperator() *SingleFilterSearchRequestOperator {
	if s == nil {
		return nil
	}
	return s.Operator
}

func (s *SingleFilterSearchRequest) GetValue() *string {
	if s == nil {
		return nil
	}
	return s.Value
}

func (s *SingleFilterSearchRequest) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *SingleFilterSearchRequest) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler SingleFilterSearchRequest
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = SingleFilterSearchRequest(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *SingleFilterSearchRequest) String() string {
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

type SingleFilterSearchRequestOperator string

const (
	SingleFilterSearchRequestOperatorEquals         = "="
	SingleFilterSearchRequestOperatorNotEquals      = "!="
	SingleFilterSearchRequestOperatorIn             = "IN"
	SingleFilterSearchRequestOperatorNotIn          = "NIN"
	SingleFilterSearchRequestOperatorLessThan       = "<"
	SingleFilterSearchRequestOperatorGreaterThan    = ">"
	SingleFilterSearchRequestOperatorContains       = "~"
	SingleFilterSearchRequestOperatorDoesNotContain = "!~"
	SingleFilterSearchRequestOperatorStartsWith     = "^"
	SingleFilterSearchRequestOperatorEndsWith       = "$"
)

func NewSingleFilterSearchRequestOperatorFromString(s string) (SingleFilterSearchRequestOperator, error) {
	switch s {
	case "=":
		return SingleFilterSearchRequestOperatorEquals, nil
	case "!=":
		return SingleFilterSearchRequestOperatorNotEquals, nil
	case "IN":
		return SingleFilterSearchRequestOperatorIn, nil
	case "NIN":
		return SingleFilterSearchRequestOperatorNotIn, nil
	case "<":
		return SingleFilterSearchRequestOperatorLessThan, nil
	case ">":
		return SingleFilterSearchRequestOperatorGreaterThan, nil
	case "~":
		return SingleFilterSearchRequestOperatorContains, nil
	case "!~":
		return SingleFilterSearchRequestOperatorDoesNotContain, nil
	case "^":
		return SingleFilterSearchRequestOperatorStartsWith, nil
	case "$":
		return SingleFilterSearchRequestOperatorEndsWith, nil
	}
	var t SingleFilterSearchRequestOperator
	return "", fmt.Errorf("%s is not a valid %T", s, t)
}

func (s SingleFilterSearchRequestOperator) Ptr() *SingleFilterSearchRequestOperator {
	return &s
}

type SearchRequest struct {
	Pagination *StartingAfterPaging `json:"pagination,omitempty" url:"pagination,omitempty"`
	Query      *SearchRequestQuery  `json:"query" url:"query"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *SearchRequest) GetPagination() *StartingAfterPaging {
	if s == nil {
		return nil
	}
	return s.Pagination
}

func (s *SearchRequest) GetQuery() *SearchRequestQuery {
	if s == nil {
		return nil
	}
	return s.Query
}

func (s *SearchRequest) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *SearchRequest) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler SearchRequest
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = SearchRequest(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *SearchRequest) String() string {
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

type PaginatedConversationResponse struct {
	Conversations []*Conversation `json:"conversations" url:"conversations"`
	Pages         *CursorPages    `json:"pages,omitempty" url:"pages,omitempty"`
	TotalCount    int             `json:"total_count" url:"total_count"`

	type_           string
	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (p *PaginatedConversationResponse) GetConversations() []*Conversation {
	if p == nil {
		return nil
	}
	return p.Conversations
}

func (p *PaginatedConversationResponse) GetPages() *CursorPages {
	if p == nil {
		return nil
	}
	return p.Pages
}

func (p *PaginatedConversationResponse) GetTotalCount() int {
	if p == nil {
		return 0
	}
	return p.TotalCount
}

func (p *PaginatedConversationResponse) GetType_() string {
	if p == nil {
		return ""
	}
	return p.type_
}

func (p *PaginatedConversationResponse) GetExtraProperties() map[string]any {
	if p == nil {
		return nil
	}
	return p.extraProperties
}

func (p *PaginatedConversationResponse) UnmarshalJSON(
	data []byte,
) error {
	type embed PaginatedConversationResponse
	var unmarshaler = struct {
		embed
		Type string `json:"type"`
	}{
		embed: embed(*p),
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	*p = PaginatedConversationResponse(unmarshaler.embed)
	if unmarshaler.Type != "conversation.list" {
		return fmt.Errorf("unexpected value for literal on type %T; expected %v got %v", p, "conversation.list", unmarshaler.Type)
	}
	p.type_ = unmarshaler.Type
	extraProperties, err := internal.ExtractExtraProperties(data, *p, "type_")
	if err != nil {
		return err
	}
	p.extraProperties = extraProperties
	p.rawJSON = json.RawMessage(data)
	return nil
}

func (p *PaginatedConversationResponse) MarshalJSON() ([]byte, error) {
	type embed PaginatedConversationResponse
	var marshaler = struct {
		embed
		Type string `json:"type"`
	}{
		embed: embed(*p),
		Type:  "conversation.list",
	}
	return json.Marshal(marshaler)
}

func (p *PaginatedConversationResponse) String() string {
	if len(p.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(p.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(p); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", p)
}

type CursorPages struct {
	Next       *StartingAfterPaging `json:"next,omitempty" url:"next,omitempty"`
	Page       *int                 `json:"page,omitempty" url:"page,omitempty"`
	PerPage    *int                 `json:"per_page,omitempty" url:"per_page,omitempty"`
	TotalPages *int                 `json:"total_pages,omitempty" url:"total_pages,omitempty"`

	type_           string
	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (c *CursorPages) GetNext() *StartingAfterPaging {
	if c == nil {
		return nil
	}
	return c.Next
}

func (c *CursorPages) GetPage() *int {
	if c == nil {
		return nil
	}
	return c.Page
}

func (c *CursorPages) GetPerPage() *int {
	if c == nil {
		return nil
	}
	return c.PerPage
}

func (c *CursorPages) GetTotalPages() *int {
	if c == nil {
		return nil
	}
	return c.TotalPages
}

func (c *CursorPages) GetType_() string {
	if c == nil {
		return ""
	}
	return c.type_
}

func (c *CursorPages) GetExtraProperties() map[string]any {
	if c == nil {
		return nil
	}
	return c.extraProperties
}

func (c *CursorPages) UnmarshalJSON(
	data []byte,
) error {
	type embed CursorPages
	var unmarshaler = struct {
		embed
		Type string `json:"type"`
	}{
		embed: embed(*c),
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	*c = CursorPages(unmarshaler.embed)
	if unmarshaler.Type != "pages" {
		return fmt.Errorf("unexpected value for literal on type %T; expected %v got %v", c, "pages", unmarshaler.Type)
	}
	c.type_ = unmarshaler.Type
	extraProperties, err := internal.ExtractExtraProperties(data, *c, "type_")
	if err != nil {
		return err
	}
	c.extraProperties = extraProperties
	c.rawJSON = json.RawMessage(data)
	return nil
}

func (c *CursorPages) MarshalJSON() ([]byte, error) {
	type embed CursorPages
	var marshaler = struct {
		embed
		Type string `json:"type"`
	}{
		embed: embed(*c),
		Type:  "pages",
	}
	return json.Marshal(marshaler)
}

func (c *CursorPages) String() string {
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

type StartingAfterPaging struct {
	PerPage       int     `json:"per_page" url:"per_page"`
	StartingAfter *string `json:"starting_after,omitempty" url:"starting_after,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *StartingAfterPaging) GetPerPage() int {
	if s == nil {
		return 0
	}
	return s.PerPage
}

func (s *StartingAfterPaging) GetStartingAfter() *string {
	if s == nil {
		return nil
	}
	return s.StartingAfter
}

func (s *StartingAfterPaging) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *StartingAfterPaging) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler StartingAfterPaging
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = StartingAfterPaging(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *StartingAfterPaging) String() string {
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

type Conversation struct {
	Foo string `json:"foo" url:"foo"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (c *Conversation) GetFoo() string {
	if c == nil {
		return ""
	}
	return c.Foo
}

func (c *Conversation) GetExtraProperties() map[string]any {
	if c == nil {
		return nil
	}
	return c.extraProperties
}

func (c *Conversation) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler Conversation
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*c = Conversation(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *c)
	if err != nil {
		return err
	}
	c.extraProperties = extraProperties
	c.rawJSON = json.RawMessage(data)
	return nil
}

func (c *Conversation) String() string {
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
