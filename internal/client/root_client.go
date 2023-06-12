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

// NewClient constructs a new Client.
func NewClient(baseURL string, doer Doer, opts ...ClientOption) (Client, error) {
	// TODO: Apply all the client options.
	userClient, err := NewUserClient(baseURL, doer, opts...)
	if err != nil {
		return nil, err
	}
	return &client{
		user: userClient,
	}, nil
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

// NewUserClient constructs a new UserClient.
func NewUserClient(baseURL string, doer Doer, opts ...ClientOption) (UserClient, error) {
	// TODO: Apply all the client options.
	return &userClient{
		getUser:    newGetUserEndpoint(baseURL, doer),
		createUser: newCreateUserEndpoint(baseURL, doer),
	}, nil
}

type client struct {
	echo func(context.Context, string) (string, error)
	user UserClient
}

func (c *client) Echo(ctx context.Context, message string) (string, error) {
	return c.echo(ctx, message)
}

func (c *client) User() UserClient {
	return c.user
}

type userClient struct {
	getUser    func(context.Context, string) (*User, error)
	createUser func(context.Context, *CreateUserRequest) (*User, error)
}

func (u *userClient) GetUser(ctx context.Context, userId string) (*User, error) {
	return u.getUser(ctx, userId)
}

func (u *userClient) CreateUser(ctx context.Context, request *CreateUserRequest) (*User, error) {
	return u.createUser(ctx, request)
}

func newGetUserEndpoint(baseURL string, doer Doer) func(context.Context, string) (*User, error) {
	return nil
}

func newCreateUserEndpoint(baseURL string, doer Doer) func(context.Context, *CreateUserRequest) (*User, error) {
	return nil
}
