using System.Net.Http;
using SeedMultiUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public partial class Ec2Client
{
    private RawClient _client;

    internal Ec2Client(RawClient client)
    {
        _client = client;
    }

    public async Task BootInstanceAsync(BootInstanceRequest request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.Environment.Ec2,
                Method = HttpMethod.Post,
                Path = "/ec2/boot",
                Body = request,
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedMultiUrlEnvironmentNoDefaultApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
