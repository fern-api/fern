using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> OptionalargsAsyncCore(
        ServiceOptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "optional-args",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("image_file", request.ImageFile);
        multipartFormRequest_.AddJsonPart("request", request.Request);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> WithinlinetypeAsyncCore(
        ServiceWithInlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "inline-type",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddJsonPart("request", request.Request);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> WithjsonpropertyAsyncCore(
        ServiceWithJsonPropertyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "with-json-property",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddJsonPart("json", request.Json);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> WithliteralandenumtypesAsyncCore(
        ServiceWithLiteralAndEnumTypesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "with-literal-enum",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddJsonPart("model_type", request.ModelType);
        multipartFormRequest_.AddJsonPart("open_enum", request.OpenEnum);
        multipartFormRequest_.AddStringPart("maybe_name", request.MaybeName);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.PostAsync(new ServicePostRequest());
    /// </code></example>
    public async Task PostAsync(
        ServicePostRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddStringPart("maybe_string", request.MaybeString);
        multipartFormRequest_.AddStringPart("integer", request.Integer);
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddFileParameterPart("file_list", request.FileList);
        multipartFormRequest_.AddFileParameterPart("maybe_file", request.MaybeFile);
        multipartFormRequest_.AddFileParameterPart("maybe_file_list", request.MaybeFileList);
        multipartFormRequest_.AddStringPart("maybe_integer", request.MaybeInteger);
        multipartFormRequest_.AddStringParts(
            "optional_list_of_strings",
            request.OptionalListOfStrings
        );
        multipartFormRequest_.AddJsonParts("list_of_objects", request.ListOfObjects);
        multipartFormRequest_.AddJsonPart("optional_metadata", request.OptionalMetadata);
        multipartFormRequest_.AddJsonPart("optional_object_type", request.OptionalObjectType);
        multipartFormRequest_.AddStringPart("optional_id", request.OptionalId);
        multipartFormRequest_.AddJsonPart("alias_object", request.AliasObject);
        multipartFormRequest_.AddJsonParts("list_of_alias_object", request.ListOfAliasObject);
        multipartFormRequest_.AddJsonParts("alias_list_of_object", request.AliasListOfObject);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.JustfileAsync(new ServiceJustFileRequest());
    /// </code></example>
    public async Task JustfileAsync(
        ServiceJustFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "just-file",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task JustfilewithqueryparamsAsync(
        ServiceJustFileWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 5)
            .Add("maybeString", request.MaybeString)
            .Add("integer", request.Integer)
            .Add("maybeInteger", request.MaybeInteger)
            .Add("listOfStrings", request.ListOfStrings)
            .Add("optionalListOfStrings", request.OptionalListOfStrings)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "just-file-with-query-params",
            QueryString = _queryString,
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.JustfilewithoptionalqueryparamsAsync(
    ///     new ServiceJustFileWithOptionalQueryParamsRequest()
    /// );
    /// </code></example>
    public async Task JustfilewithoptionalqueryparamsAsync(
        ServiceJustFileWithOptionalQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("maybeString", request.MaybeString)
            .Add("maybeInteger", request.MaybeInteger)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "just-file-with-optional-query-params",
            QueryString = _queryString,
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.WithcontenttypeAsync(new ServiceWithContentTypeRequest());
    /// </code></example>
    public async Task WithcontenttypeAsync(
        ServiceWithContentTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "with-content-type",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddStringPart("foo", request.Foo);
        multipartFormRequest_.AddJsonPart("bar", request.Bar);
        multipartFormRequest_.AddJsonPart("foo_bar", request.FooBar);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.WithformencodingAsync(new ServiceWithFormEncodingRequest());
    /// </code></example>
    public async Task WithformencodingAsync(
        ServiceWithFormEncodingRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "with-form-encoding",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddStringPart("foo", request.Foo);
        multipartFormRequest_.AddJsonPart("bar", request.Bar);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.WithformencodedcontainersAsync(new ServiceWithFormEncodedContainersRequest());
    /// </code></example>
    public async Task WithformencodedcontainersAsync(
        ServiceWithFormEncodedContainersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            Method = HttpMethod.Post,
            Path = "form-encoded",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddStringPart("maybe_string", request.MaybeString);
        multipartFormRequest_.AddStringPart("integer", request.Integer);
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddFileParameterPart("file_list", request.FileList);
        multipartFormRequest_.AddFileParameterPart("maybe_file", request.MaybeFile);
        multipartFormRequest_.AddFileParameterPart("maybe_file_list", request.MaybeFileList);
        multipartFormRequest_.AddStringPart("maybe_integer", request.MaybeInteger);
        multipartFormRequest_.AddStringParts(
            "optional_list_of_strings",
            request.OptionalListOfStrings
        );
        multipartFormRequest_.AddJsonParts("list_of_objects", request.ListOfObjects);
        multipartFormRequest_.AddJsonPart("optional_metadata", request.OptionalMetadata);
        multipartFormRequest_.AddJsonPart("optional_object_type", request.OptionalObjectType);
        multipartFormRequest_.AddStringPart("optional_id", request.OptionalId);
        multipartFormRequest_.AddJsonParts(
            "list_of_objects_with_optionals",
            request.ListOfObjectsWithOptionals
        );
        multipartFormRequest_.AddJsonPart("alias_object", request.AliasObject);
        multipartFormRequest_.AddJsonParts("list_of_alias_object", request.ListOfAliasObject);
        multipartFormRequest_.AddJsonParts("alias_list_of_object", request.AliasListOfObject);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.OptionalargsAsync(new ServiceOptionalArgsRequest());
    /// </code></example>
    public WithRawResponseTask<string> OptionalargsAsync(
        ServiceOptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            OptionalargsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Service.WithinlinetypeAsync(new ServiceWithInlineTypeRequest());
    /// </code></example>
    public WithRawResponseTask<string> WithinlinetypeAsync(
        ServiceWithInlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            WithinlinetypeAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Service.WithjsonpropertyAsync(new ServiceWithJsonPropertyRequest());
    /// </code></example>
    public WithRawResponseTask<string> WithjsonpropertyAsync(
        ServiceWithJsonPropertyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            WithjsonpropertyAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Service.SimpleAsync();
    /// </code></example>
    public async Task SimpleAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "snippet",
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.WithliteralandenumtypesAsync(new ServiceWithLiteralAndEnumTypesRequest());
    /// </code></example>
    public WithRawResponseTask<string> WithliteralandenumtypesAsync(
        ServiceWithLiteralAndEnumTypesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            WithliteralandenumtypesAsyncCore(request, options, cancellationToken)
        );
    }
}
