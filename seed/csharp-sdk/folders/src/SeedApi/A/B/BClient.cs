using SeedApi.Core;

#nullable enable

namespace SeedApi.A.B;

public class BClient
{
    private RawClient _client;

    public BClient(RawClient client)
    {
        _client = client;
    }

    public async void FooAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = "" }
        );
    }
}
