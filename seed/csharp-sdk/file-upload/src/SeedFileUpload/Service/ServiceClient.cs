using System.Net.Http;
using System.Threading;
using global::System.Threading.Tasks;
using SeedFileUpload.Core;

namespace SeedFileUpload;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async global::System.Threading.Tasks.Task PostAsync(
        MyRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest = new RawClient.MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "",
            Options = options,
        };
        multipartFormRequest.AddStringPart("maybe_string", request.MaybeString);
        multipartFormRequest.AddStringPart("integer", request.Integer);
        multipartFormRequest.AddFileParameterPart("file", request.File);
        multipartFormRequest.AddFileParameterParts("file_list", request.FileList);
        multipartFormRequest.AddFileParameterPart("maybe_file", request.File);
        multipartFormRequest.AddFileParameterParts("maybe_file_list", request.MaybeFileList);
        multipartFormRequest.AddStringPart("maybe_integer", request.MaybeInteger);
        multipartFormRequest.AddStringParts("optional_list_of_strings", request.OptionalListOfStrings);
        multipartFormRequest.AddJsonParts("list_of_objects", request.ListOfObjects);
        multipartFormRequest.AddJsonPart("optional_metadata", request.OptionalMetadata);
        multipartFormRequest.AddJsonPart("optional_object_type", request.OptionalMetadata);
        multipartFormRequest.AddStringPart("optional_id", request.OptionalId);
        multipartFormRequest.AddJsonParts("list_of_objects_with_optionals", request.ListOfObjectsWithOptionals);
        multipartFormRequest.AddJsonPart("alias_object", request.AliasObject);
        multipartFormRequest.AddJsonParts("list_of_alias_object", request.ListOfAliasObject);
        multipartFormRequest.AddJsonParts("alias_list_of_object", request.AliasListOfObject);
        var response = await _client
            .SendRequestAsync(
                multipartFormRequest,
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

    public async global::System.Threading.Tasks.Task JustFileAsync(
        JustFileRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest = new RawClient.MultipartFormRequest()
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file",
            Options = options,
        };
        multipartFormRequest.AddFileParameterPart("file", request.File);
        var response = await _client
            .SendRequestAsync(
                multipartFormRequest,
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

    public async global::System.Threading.Tasks.Task JustFileWithQueryParamsAsync(
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

        var multipartFormRequest = new RawClient.MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/just-file-with-query-params",
            Options = options,
            Query = _query,
        };
        multipartFormRequest.AddFileParameterPart("file", request.File);
        var response = await _client
            .SendRequestAsync(
                multipartFormRequest,
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

    public async global::System.Threading.Tasks.Task WithContentTypeAsync(
        WithContentTypeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest = new RawClient.MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-content-type",
            Options = options,
        };
        multipartFormRequest.AddFileParameterPart("file", request.File, "application/octet-stream");
        multipartFormRequest.AddStringPart("foo", request.Foo);
        multipartFormRequest.AddJsonPart("bar", request.Bar, "application/json");
        multipartFormRequest.AddJsonPart("foo_bar", request.FooBar, "application/json");
        var response = await _client
            .SendRequestAsync(
                multipartFormRequest,
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

    public async global::System.Threading.Tasks.Task WithFormEncodingAsync(
        WithFormEncodingRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest = new RawClient.MultipartFormRequest
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "/with-form-encoding",
            Options = options,
        };
        multipartFormRequest.AddFileParameterPart("file", request.File);
        multipartFormRequest.AddStringPart("foo", request.Foo);
        multipartFormRequest.AddFormEncodedPart("bar", request.Bar, "application/json");
        var response = await _client
            .SendRequestAsync(
                multipartFormRequest,
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

    public async global::System.Threading.Tasks.Task WithFormEncodedContainersAsync(
        MyOtherRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var multipartFormRequest = new RawClient.MultipartFormRequest()
        {
            BaseUrl = _client.Options.BaseUrl,
            Method = HttpMethod.Post,
            Path = "",
            Options = options,
        };
        multipartFormRequest.AddStringPart("maybe_string", request.MaybeString);
        multipartFormRequest.AddStringPart("integer", request.Integer);
        multipartFormRequest.AddFileParameterPart("file", request.File);
        multipartFormRequest.AddFileParameterParts("file_list", request.FileList);
        multipartFormRequest.AddFileParameterPart("maybe_file", request.File);
        multipartFormRequest.AddFileParameterParts("maybe_file_list", request.MaybeFileList);
        multipartFormRequest.AddStringPart("maybe_integer", request.MaybeInteger);
        multipartFormRequest.AddFormEncodedPart("optional_list_of_strings", request.OptionalListOfStrings);
        multipartFormRequest.AddFormEncodedPart("list_of_objects", request.ListOfObjects);
        multipartFormRequest.AddFormEncodedPart("optional_metadata", request.OptionalMetadata);
        multipartFormRequest.AddFormEncodedPart("optional_object_type", request.OptionalMetadata);
        multipartFormRequest.AddStringPart("optional_id", request.OptionalId);
        multipartFormRequest.AddFormEncodedPart("list_of_objects_with_optionals", request.ListOfObjectsWithOptionals);
        multipartFormRequest.AddFormEncodedPart("alias_object", request.AliasObject);
        multipartFormRequest.AddFormEncodedPart("list_of_alias_object", request.ListOfAliasObject);
        multipartFormRequest.AddFormEncodedPart("alias_list_of_object", request.AliasListOfObject);
        var response = await _client
            .SendRequestAsync(
                multipartFormRequest,
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