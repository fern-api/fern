using System.Text.Json;
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

    public async void GenerateStreamAsync(GenerateStreamRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "generate-stream",
                Body = request
            }
        );
    }

    public async Task<StreamResponse> GenerateAsync(Generateequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "generate",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<StreamResponse>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
