using System.Net.Http;
using SeedFileUpload;
using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task PostAsync(MyRequest request, RequestOptions? options)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Options = options
            }
        );
    }

    public async Task JustFileAsync(JustFileRequet request, RequestOptions? options)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/just-file",
                Options = options
            }
        );
    }

    public async Task JustFileWithQueryParamsAsync(
        JustFileWithQueryParamsRequet request,
        RequestOptions? options
    )
    {
        var _query = new Dictionary<string, object>() { };
        _query["integer"] = request.Integer.ToString();
        _query["listOfStrings"] = request.ListOfStrings;
        _query["optionalListOfStrings"] = request.OptionalListOfStrings;
        if (request.MaybeString != null)
        {
            _query["maybeString"] = request.MaybeString;
        }
        if (request.MaybeInteger != null)
        {
            _query["maybeInteger"] = request.MaybeInteger.ToString();
        }
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/just-file-with-query-params",
                Query = _query,
                Options = options
            }
        );
    }
}
