package client

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"path"
)

// CreateUserRequest is the request shape for creating users.
type CreateUserRequest struct {
	Name string `json:"name"`
}

// User is a user.
type User struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

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
	userClient, err := newUserClient(path.Join(baseURL, "users"), doer, opts...)
	if err != nil {
		return nil, err
	}
	return &client{
		user: userClient,
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

// UserClient is a service defined in the user subpackage.
type UserClient interface {
	GetUser(ctx context.Context, userId string) (*User, error)
	CreateUser(ctx context.Context, request *CreateUserRequest) (*User, error)
}

// newUserClient constructs a new UserClient.
func newUserClient(baseURL string, doer Doer, opts ...ClientOption) (UserClient, error) {
	// TODO: Apply all the client options.
	return &userClient{
		getUser:    newGetUserEndpoint(baseURL, doer).Call,
		createUser: newCreateUserEndpoint(baseURL, doer).Call,
	}, nil
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

type getUserEndpoint struct {
	url    string
	client Doer
}

func newGetUserEndpoint(url string, doer Doer) *getUserEndpoint {
	return &getUserEndpoint{
		url:    url,
		client: doer,
	}
}

func (g *getUserEndpoint) Call(ctx context.Context, userId string) (*User, error) {
	endpointURL := path.Join(g.url, userId)
	response := new(User)
	if err := doRequest(
		ctx,
		g.client,
		endpointURL,
		http.MethodGet,
		nil,
		response,
		nil,
		g.decodeError,
	); err != nil {
		return nil, err
	}
	return response, nil
}

func (g *getUserEndpoint) decodeError(statusCode int, body io.Reader) error {
	decoder := json.NewDecoder(body)
	switch statusCode {
	case 404:
		value := new(UserNotFoundError)
		if err := decoder.Decode(value); err != nil {
			return err
		}
		value.StatusCode = statusCode
		return value
	}
	bytes, err := io.ReadAll(body)
	if err != nil {
		return err
	}
	return errors.New(string(bytes))
}

type createUserEndpoint struct {
	url    string
	client Doer
}

func newCreateUserEndpoint(url string, doer Doer) *createUserEndpoint {
	return &createUserEndpoint{
		url:    url,
		client: doer,
	}
}

func (c *createUserEndpoint) Call(ctx context.Context, request *CreateUserRequest) (*User, error) {
	endpointURL := c.url
	response := new(User)
	if err := doRequest(
		ctx,
		c.client,
		endpointURL,
		http.MethodPost,
		request,
		response,
		nil,
		c.decodeError,
	); err != nil {
		return nil, err
	}
	return response, nil
}

func (c *createUserEndpoint) decodeError(statusCode int, body io.Reader) error {
	bytes, err := io.ReadAll(body)
	if err != nil {
		return err
	}
	return errors.New(string(bytes))
}
