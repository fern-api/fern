using SeedStreaming;

#nullable enable

namespace SeedStreaming;

public class DummyClient
{
    private RawClient _client;

    public DummyClient(RawClient client)
    {
        _client = client;
    }

    public async void GenerateStreamAsync(GenerateStreamRequestzs request)
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
}
