using System.Net.Http;
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

    public async Task BootInstanceAsync(BootInstanceRequest request)
    {
        await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseURL = _client.Options.Environment.Ec2,
                Method = HttpMethod.Post,
                Path = "/ec2/boot",
                Body = request
            }
        );
    }
}
