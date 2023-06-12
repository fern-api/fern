package client

import "context"

// Client is an example of the top-level generated client interface
// that interacts with the rest of the generated code.
type Client interface {
	// Echo is a simple echo endpoint that replies with
	// the same value as the request.
	//
	// This endpooint is defined in the root package.
	// https://buildwithfern.com/docs/definition/packages#package-configuration
	Echo(context.Context, string) (string, error)

	// The user endpoints are encapsulated under the User field so that it
	// matches the hierarchy of the Fern API definition.
	User() UserClient
}

// CreateUserRequest is the request shape for creating users.
type CreateUserRequest struct {
	Name string `json:"name"`
}

// User is a user.
type User struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

// UserClient is a service defined in the user subpackage.
type UserClient interface {
	GetUser(ctx context.Context, userId string) (*User, error)
	CreateUser(ctx context.Context, request *CreateUserRequest) (*User, error)
}
