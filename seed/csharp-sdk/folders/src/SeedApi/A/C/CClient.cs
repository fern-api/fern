using SeedApi;
using SeedApi.Core;

namespace SeedApi.A.C;

public partial class CClient : ICClient
{
    private RawClient _client;

    internal CClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public CClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.A.C.FooAsync();
    /// </code></example>
    public async Task FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.FooAsync(options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> FooAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
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
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
