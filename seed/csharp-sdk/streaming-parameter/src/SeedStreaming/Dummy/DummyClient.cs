using System.Net.Http;
using SeedStreaming;
using SeedStreaming.Core;

#nullable enable

namespace SeedStreaming;

public class DummyClient
{
    private RawClient _client;

    public DummyClient(RawClient client)
    {
        _client = client;
    }

    public async Task GenerateAsync(GenerateRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "generate",
                Body = request
            }
        );
    }
}
