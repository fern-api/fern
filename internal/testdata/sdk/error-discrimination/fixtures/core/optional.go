package core

import (
	"encoding/json"
	"fmt"
)

// Optional is a wrapper used to distinguish zero values from
// null or omitted fields.
//
// To instantiate an Optional, use the `Optional()` and `Null()`
// helpers exported from the root package.
type Optional[T any] struct {
	Value T
	Null  bool
}

func (o *Optional[T]) String() string {
	if o == nil {
		return ""
	}
	if s, ok := any(o.Value).(fmt.Stringer); ok {
		return s.String()
	}
	return fmt.Sprintf("%#v", o.Value)
}

func (o *Optional[T]) MarshalJSON() ([]byte, error) {
	if o == nil {
		return nil, nil
	}
	if o.Null {
		return []byte("null"), nil
	}
	return json.Marshal(&o.Value)
}
