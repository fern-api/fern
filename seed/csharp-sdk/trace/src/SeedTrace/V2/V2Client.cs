using SeedTrace;
using SeedTrace.Core;
using SeedTrace.V2.V3;

namespace SeedTrace.V2;

public partial class V2Client : IV2Client
{
    private RawClient _client;

    internal V2Client(RawClient client)
    {
        _client = client;
        Problem = new ProblemClient(_client);
        V3 = new V3Client(_client);
        Raw = new RawAccessClient(_client);
    }

    public ProblemClient Problem { get; }

    public V3Client V3 { get; }

    public V2Client.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.V2.TestAsync();
    /// </code></example>
    public async Task TestAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.TestAsync(options, cancellationToken);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> TestAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "",
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
                throw new SeedTraceApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
