using System.Net.Http;
using SeedApi.Core;

#nullable enable

namespace SeedApi.Folder;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task EndpointAsync(RequestOptions? options)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/service",
                Options = options
            }
        );
    }

    public async Task UnknownRequestAsync(object request, RequestOptions? options)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/service",
                Body = request,
                Options = options
            }
        );
    }
}
