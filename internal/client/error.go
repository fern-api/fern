package client

import "fmt"

// UserNotFoundError represents a custom error specified
// in a Fern definition. If the server responds with an
// error in this shape, it will be available in the error
// return value.
//
// If present, the type can be accessed like so:
//
//	foo, err := client.Foo(ctx, request)
//	if err != nil {
//	  switch err.(type) {
//	  case *UserNotFoundError:
//	    // Act upon the user not found error.
//	  }
//	  // Otherwise treat it as a normal, unstructured error.
//	}
//
// This type is referenced from the following:
// https://buildwithfern.com/docs/definition/errors
type UserNotFoundError struct {
	StatusCode      int    `json:"-"`
	RequestedUserId string `json:"requestedUserId"`
}

// Implements the error interface.
func (u *UserNotFoundError) Error() string {
	if u == nil {
		return ""
	}
	// TODO: This isn't pretty, is there something better we
	// can do without standard error fields, like message, etc?
	//
	// 404: {RequestedUserId:<something>}
	return fmt.Sprintf("404: %+v", *u)
}

// UserNotFoundErrorBody will also be generated because
// it's just an ordinary type.
type UserNotFoundErrorBody struct {
	RequestedUserId string `json:"requestedUserId"`
}
