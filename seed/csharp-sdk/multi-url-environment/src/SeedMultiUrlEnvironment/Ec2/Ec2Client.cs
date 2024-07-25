using System.Net.Http;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Core;

#nullable enable

namespace SeedMultiUrlEnvironment;

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
