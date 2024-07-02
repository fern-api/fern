using SeedMultiUrlEnvironmentNoDefault;
using SeedMultiUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

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
