using System.Text.Json;
using SeedFileUpload.Core;

namespace SeedFileUpload;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> OptionalArgsAsyncCore(
        OptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/optional-args",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("image_file", request.ImageFile, "image/jpeg");
        multipartFormRequest_.AddJsonPart(
            "request",
            request.Request,
            "application/json; charset=utf-8"
        );
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
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
                throw new SeedFileUploadApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> WithInlineTypeAsyncCore(
        InlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/inline-type",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
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
                throw new SeedFileUploadApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<string>> WithLiteralAndEnumTypesAsyncCore(
        LiteralEnumRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-literal-enum",
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddStringPart("model_type", request.ModelType);
        multipartFormRequest_.AddJsonPart("open_enum", request.OpenEnum);
        multipartFormRequest_.AddStringPart("maybe_name", request.MaybeName);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
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
                throw new SeedFileUploadApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task PostAsync(
        MyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.JustFileAsync(new JustFileRequest());
    /// </code></example>
    public async Task JustFileAsync(
        JustFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task JustFileWithQueryParamsAsync(
        JustFileWithQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedFileUpload.Core.QueryStringBuilder.Builder(capacity: 5)
            .Add("maybeString", request.MaybeString)
            .Add("integer", request.Integer)
            .Add("maybeInteger", request.MaybeInteger)
            .Add("listOfStrings", request.ListOfStrings)
            .Add("optionalListOfStrings", request.OptionalListOfStrings)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file-with-query-params",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task JustFileWithOptionalQueryParamsAsync(
        JustFileWithOptionalQueryParamsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedFileUpload.Core.QueryStringBuilder.Builder(capacity: 2)
            .Add("maybeString", request.MaybeString)
            .Add("maybeInteger", request.MaybeInteger)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file-with-optional-query-params",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task WithContentTypeAsync(
        WithContentTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-content-type",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart(
            "file",
            request.File,
            "application/octet-stream"
        );
        multipartFormRequest_.AddStringPart("foo", request.Foo);
        multipartFormRequest_.AddJsonPart("bar", request.Bar, "application/json");
        multipartFormRequest_.AddJsonPart("foo_bar", request.FooBar, "application/json");
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task WithFormEncodingAsync(
        WithFormEncodingRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-form-encoding",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFileParameterPart(
            "file",
            request.File,
            "application/octet-stream"
        );
        multipartFormRequest_.AddFormEncodedPart("foo", request.Foo);
        multipartFormRequest_.AddFormEncodedPart("bar", request.Bar);
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public async Task WithFormEncodedContainersAsync(
        MyOtherRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "",
            Headers = _headers,
            Options = options,
        };
        multipartFormRequest_.AddFormEncodedPart("maybe_string", request.MaybeString);
        multipartFormRequest_.AddFormEncodedPart("integer", request.Integer);
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddFileParameterPart("file_list", request.FileList);
        multipartFormRequest_.AddFileParameterPart("maybe_file", request.MaybeFile);
        multipartFormRequest_.AddFileParameterPart("maybe_file_list", request.MaybeFileList);
        multipartFormRequest_.AddFormEncodedPart("maybe_integer", request.MaybeInteger);
        multipartFormRequest_.AddFormEncodedParts(
            "optional_list_of_strings",
            request.OptionalListOfStrings
        );
        multipartFormRequest_.AddFormEncodedParts("list_of_objects", request.ListOfObjects);
        multipartFormRequest_.AddFormEncodedPart("optional_metadata", request.OptionalMetadata);
        multipartFormRequest_.AddFormEncodedPart(
            "optional_object_type",
            request.OptionalObjectType
        );
        multipartFormRequest_.AddFormEncodedPart("optional_id", request.OptionalId);
        multipartFormRequest_.AddFormEncodedParts(
            "list_of_objects_with_optionals",
            request.ListOfObjectsWithOptionals
        );
        multipartFormRequest_.AddFormEncodedPart("alias_object", request.AliasObject);
        multipartFormRequest_.AddFormEncodedParts(
            "list_of_alias_object",
            request.ListOfAliasObject
        );
        multipartFormRequest_.AddFormEncodedParts(
            "alias_list_of_object",
            request.AliasListOfObject
        );
        var response = await _client
            .SendRequestAsync(multipartFormRequest_, cancellationToken)
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.OptionalArgsAsync(new OptionalArgsRequest());
    /// </code></example>
    public WithRawResponseTask<string> OptionalArgsAsync(
        OptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            OptionalArgsAsyncCore(request, options, cancellationToken)
        );
    }

    public WithRawResponseTask<string> WithInlineTypeAsync(
        InlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            WithInlineTypeAsyncCore(request, options, cancellationToken)
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
        var _headers = await new SeedFileUpload.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/snippet",
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedFileUploadApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    public WithRawResponseTask<string> WithLiteralAndEnumTypesAsync(
        LiteralEnumRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            WithLiteralAndEnumTypesAsyncCore(request, options, cancellationToken)
        );
    }
}
