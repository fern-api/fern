using System.Net.Http;
using SeedBytes.Core;

#nullable enable

namespace SeedBytes;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task UploadAsync(Stream request, RequestOptions? options)
    {
        await _client.MakeRequestAsync(
            new RawClient.StreamApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "upload-content",
                Body = request,
                Options = options
            }
        );
    }
}
