using System.Text.Json;
using SeedFileUpload.Core;

namespace SeedFileUpload;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task PostAsync(
        MyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "",
            Options = options,
        };
        multipartFormRequest_.AddStringPart("maybe_string", request.MaybeString);
        multipartFormRequest_.AddStringPart("integer", request.Integer);
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddFileParameterParts("file_list", request.FileList);
        multipartFormRequest_.AddFileParameterPart("maybe_file", request.MaybeFile);
        multipartFormRequest_.AddFileParameterParts("maybe_file_list", request.MaybeFileList);
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
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file",
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
        var _query = new Dictionary<string, object>();
        _query["integer"] = request.Integer.ToString();
        _query["listOfStrings"] = request.ListOfStrings;
        _query["optionalListOfStrings"] = request.OptionalListOfStrings;
        if (request.MaybeString != null)
        {
            _query["maybeString"] = request.MaybeString;
        }
        if (request.MaybeInteger != null)
        {
            _query["maybeInteger"] = request.MaybeInteger.Value.ToString();
        }
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file-with-query-params",
            Query = _query,
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
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-content-type",
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
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-form-encoding",
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
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "",
            Options = options,
        };
        multipartFormRequest_.AddFormEncodedPart("maybe_string", request.MaybeString);
        multipartFormRequest_.AddFormEncodedPart("integer", request.Integer);
        multipartFormRequest_.AddFileParameterPart("file", request.File);
        multipartFormRequest_.AddFileParameterParts("file_list", request.FileList);
        multipartFormRequest_.AddFileParameterPart("maybe_file", request.MaybeFile);
        multipartFormRequest_.AddFileParameterParts("maybe_file_list", request.MaybeFileList);
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
    public async Task<string> OptionalArgsAsync(
        OptionalArgsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/optional-args",
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
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedFileUploadException("Failed to deserialize response", e);
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

    public async Task<string> WithInlineTypeAsync(
        InlineTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest_ = new MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/inline-type",
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
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedFileUploadException("Failed to deserialize response", e);
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

    /// <example><code>
    /// await client.Service.SimpleAsync();
    /// </code></example>
    public async Task SimpleAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/snippet",
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
}
