using SeedBytes;

#nullable enable

namespace SeedBytes;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async void UploadAsync(Stream request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.StreamApiRequest
            {
                Method = HttpMethod.Post,
                Path = "upload-content",
                Body = request
            }
        );
    }
}
