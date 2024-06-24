using SeedMultiUrlEnvironment;

#nullable enable

namespace SeedMultiUrlEnvironment;

public class Ec2Client
{
    private RawClient _client;

    public Ec2Client(RawClient client)
    {
        _client = client;
    }

    public async void BootInstanceAsync(BootInstanceRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/ec2/boot",
                Body = request
            }
        );
    }
}
