using SeedExhaustive;

namespace SeedExhaustive;

public class ReqWithHeadersClient
{
    private RawClient _client;

    public ReqWithHeadersClient(RawClient client)
    {
        _client = client;
    }

    public async void GetWithCustomHeaderAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/custom-header",
                Body = request
            }
        );
    }
}
