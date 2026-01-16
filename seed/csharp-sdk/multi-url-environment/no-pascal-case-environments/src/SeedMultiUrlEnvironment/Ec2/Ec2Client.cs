using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class Ec2Client : IEc2Client
{
    private RawClient _client;

    internal Ec2Client(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public Ec2Client.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Ec2.BootInstanceAsync(new BootInstanceRequest { Size = "size" });
    /// </code></example>
    public async Task BootInstanceAsync(
        BootInstanceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.BootInstanceAsync(request, options, cancellationToken);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> BootInstanceAsync(
            BootInstanceRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.Environment.Ec2,
                        Method = HttpMethod.Post,
                        Path = "/ec2/boot",
                        Body = request,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
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
}
