// Code generated by Fern. DO NOT EDIT.

package service

import (
	context "context"
	fmt "fmt"
	fern "github.com/file-upload/fern"
	core "github.com/file-upload/fern/core"
	internal "github.com/file-upload/fern/internal"
	option "github.com/file-upload/fern/option"
	io "io"
	http "net/http"
)

type Client struct {
	baseURL string
	caller  *internal.Caller
	header  http.Header

	WithRawResponse *RawClient
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
		baseURL: options.BaseURL,
		caller: internal.NewCaller(
			&internal.CallerParams{
				Client:      options.HTTPClient,
				MaxAttempts: options.MaxAttempts,
			},
		),
		header:          options.ToHeader(),
		WithRawResponse: NewRawClient(options),
	}
}

func (c *Client) Post(
	ctx context.Context,
	file io.Reader,
	fileList []io.Reader,
	maybeFile io.Reader,
	maybeFileList []io.Reader,
	request *fern.MyRequest,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if err := writer.WriteFile("file", file); err != nil {
		return err
	}
	for _, f := range fileList {
		if err := writer.WriteFile("file_list", f); err != nil {
			return err
		}
	}
	if maybeFile != nil {
		if err := writer.WriteFile("maybe_file", maybeFile); err != nil {
			return err
		}
	}
	for _, f := range maybeFileList {
		if err := writer.WriteFile("maybe_file_list", f); err != nil {
			return err
		}
	}
	if request.MaybeString != nil {
		if err := writer.WriteField("maybe_string", fmt.Sprintf("%v", *request.MaybeString)); err != nil {
			return err
		}
	}
	if err := writer.WriteField("integer", fmt.Sprintf("%v", request.Integer)); err != nil {
		return err
	}
	if request.MaybeInteger != nil {
		if err := writer.WriteField("maybe_integer", fmt.Sprintf("%v", *request.MaybeInteger)); err != nil {
			return err
		}
	}
	for _, part := range request.OptionalListOfStrings {
		if err := writer.WriteField("optional_list_of_strings", fmt.Sprintf("%v", part)); err != nil {
			return err
		}
	}
	for _, part := range request.ListOfObjects {
		if err := writer.WriteJSON("list_of_objects", part); err != nil {
			return err
		}
	}
	if request.OptionalMetadata != nil {
		if err := writer.WriteJSON("optional_metadata", request.OptionalMetadata); err != nil {
			return err
		}
	}
	if request.OptionalObjectType != nil {
		if err := writer.WriteJSON("optional_object_type", *request.OptionalObjectType); err != nil {
			return err
		}
	}
	if request.OptionalId != nil {
		if err := writer.WriteJSON("optional_id", *request.OptionalId); err != nil {
			return err
		}
	}
	if err := writer.WriteJSON("alias_object", request.AliasObject); err != nil {
		return err
	}
	for _, part := range request.ListOfAliasObject {
		if err := writer.WriteJSON("list_of_alias_object", part); err != nil {
			return err
		}
	}
	for _, part := range request.AliasListOfObject {
		if err := writer.WriteJSON("alias_list_of_object", part); err != nil {
			return err
		}
	}
	if err := writer.Close(); err != nil {
		return err
	}
	headers.Set("Content-Type", writer.ContentType())

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
		},
	); err != nil {
		return err
	}
	return nil
}

func (c *Client) JustFile(
	ctx context.Context,
	file io.Reader,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL + "/just-file"
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if err := writer.WriteFile("file", file); err != nil {
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	headers.Set("Content-Type", writer.ContentType())

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
		},
	); err != nil {
		return err
	}
	return nil
}

func (c *Client) JustFileWithQueryParams(
	ctx context.Context,
	file io.Reader,
	request *fern.JustFileWithQueryParamsRequest,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL + "/just-file-with-query-params"
	queryParams, err := internal.QueryValues(request)
	if err != nil {
		return err
	}
	if len(queryParams) > 0 {
		endpointURL += "?" + queryParams.Encode()
	}
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if err := writer.WriteFile("file", file); err != nil {
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	headers.Set("Content-Type", writer.ContentType())

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
		},
	); err != nil {
		return err
	}
	return nil
}

func (c *Client) WithContentType(
	ctx context.Context,
	file io.Reader,
	request *fern.WithContentTypeRequest,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL + "/with-content-type"
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if err := writer.WriteFile("file", file, internal.WithDefaultContentType("application/octet-stream")); err != nil {
		return err
	}
	if err := writer.WriteField("foo", fmt.Sprintf("%v", request.Foo)); err != nil {
		return err
	}
	if err := writer.WriteJSON("bar", request.Bar, internal.WithDefaultContentType("application/json")); err != nil {
		return err
	}
	if request.FooBar != nil {
		if err := writer.WriteJSON("foo_bar", request.FooBar, internal.WithDefaultContentType("application/json")); err != nil {
			return err
		}
	}
	if err := writer.Close(); err != nil {
		return err
	}
	headers.Set("Content-Type", writer.ContentType())

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
		},
	); err != nil {
		return err
	}
	return nil
}

func (c *Client) WithFormEncoding(
	ctx context.Context,
	file io.Reader,
	request *fern.WithFormEncodingRequest,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL + "/with-form-encoding"
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if err := writer.WriteFile("file", file, internal.WithDefaultContentType("application/octet-stream")); err != nil {
		return err
	}
	if err := writer.WriteField("foo", fmt.Sprintf("%v", request.Foo)); err != nil {
		return err
	}
	if err := writer.WriteJSON("bar", request.Bar); err != nil {
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	headers.Set("Content-Type", writer.ContentType())

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
		},
	); err != nil {
		return err
	}
	return nil
}

func (c *Client) WithFormEncodedContainers(
	ctx context.Context,
	file io.Reader,
	fileList []io.Reader,
	maybeFile io.Reader,
	maybeFileList []io.Reader,
	request *fern.MyOtherRequest,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if err := writer.WriteFile("file", file); err != nil {
		return err
	}
	for _, f := range fileList {
		if err := writer.WriteFile("file_list", f); err != nil {
			return err
		}
	}
	if maybeFile != nil {
		if err := writer.WriteFile("maybe_file", maybeFile); err != nil {
			return err
		}
	}
	for _, f := range maybeFileList {
		if err := writer.WriteFile("maybe_file_list", f); err != nil {
			return err
		}
	}
	if request.MaybeString != nil {
		if err := writer.WriteField("maybe_string", fmt.Sprintf("%v", *request.MaybeString)); err != nil {
			return err
		}
	}
	if err := writer.WriteField("integer", fmt.Sprintf("%v", request.Integer)); err != nil {
		return err
	}
	if request.MaybeInteger != nil {
		if err := writer.WriteField("maybe_integer", fmt.Sprintf("%v", *request.MaybeInteger)); err != nil {
			return err
		}
	}
	for _, part := range request.OptionalListOfStrings {
		if err := writer.WriteField("optional_list_of_strings", fmt.Sprintf("%v", part)); err != nil {
			return err
		}
	}
	for _, part := range request.ListOfObjects {
		if err := writer.WriteJSON("list_of_objects", part); err != nil {
			return err
		}
	}
	if request.OptionalMetadata != nil {
		if err := writer.WriteJSON("optional_metadata", request.OptionalMetadata); err != nil {
			return err
		}
	}
	if request.OptionalObjectType != nil {
		if err := writer.WriteJSON("optional_object_type", *request.OptionalObjectType); err != nil {
			return err
		}
	}
	if request.OptionalId != nil {
		if err := writer.WriteJSON("optional_id", *request.OptionalId); err != nil {
			return err
		}
	}
	for _, part := range request.ListOfObjectsWithOptionals {
		if err := writer.WriteJSON("list_of_objects_with_optionals", part); err != nil {
			return err
		}
	}
	if err := writer.WriteJSON("alias_object", request.AliasObject); err != nil {
		return err
	}
	for _, part := range request.ListOfAliasObject {
		if err := writer.WriteJSON("list_of_alias_object", part); err != nil {
			return err
		}
	}
	for _, part := range request.AliasListOfObject {
		if err := writer.WriteJSON("alias_list_of_object", part); err != nil {
			return err
		}
	}
	if err := writer.Close(); err != nil {
		return err
	}
	headers.Set("Content-Type", writer.ContentType())

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
		},
	); err != nil {
		return err
	}
	return nil
}

func (c *Client) OptionalArgs(
	ctx context.Context,
	imageFile io.Reader,
	request *fern.OptionalArgsRequest,
	opts ...option.RequestOption,
) (string, error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL + "/optional-args"
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)
	writer := internal.NewMultipartWriter()
	if imageFile != nil {
		if err := writer.WriteFile("image_file", imageFile, internal.WithDefaultContentType("image/jpeg")); err != nil {
			return "", err
		}
	}
	if request.Request != nil {
		if err := writer.WriteJSON("request", request.Request, internal.WithDefaultContentType("application/json; charset=utf-8")); err != nil {
			return "", err
		}
	}
	if err := writer.Close(); err != nil {
		return "", err
	}
	headers.Set("Content-Type", writer.ContentType())

	var response string
	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         writer.Buffer(),
			Response:        &response,
		},
	); err != nil {
		return "", err
	}
	return response, nil
}

func (c *Client) Simple(
	ctx context.Context,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := baseURL + "/snippet"
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)

	if _, err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
		},
	); err != nil {
		return err
	}
	return nil
}
