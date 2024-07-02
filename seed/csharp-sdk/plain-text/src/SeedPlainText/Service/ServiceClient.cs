using SeedPlainText.Core;

#nullable enable

namespace SeedPlainText;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void GetTextAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Post, Path = "text" }
        );
    }
}
