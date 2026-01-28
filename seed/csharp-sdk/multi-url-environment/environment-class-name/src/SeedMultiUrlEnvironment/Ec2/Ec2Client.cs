using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class Ec2Client : IEc2Client
{
    private RawClient _client;

    internal Ec2Client(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Ec2.BootInstanceAsync(new BootInstanceRequest { Size = "size" });
    /// </code></example>
    public async Task BootInstanceAsync(
        BootInstanceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedMultiUrlEnvironment.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.Environment.Ec2,
                    Method = HttpMethod.Post,
                    Path = "/ec2/boot",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMultiUrlEnvironmentApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
