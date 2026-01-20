using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials;

public partial class SimpleClient : ISimpleClient
{
    private RawClient _client;

    internal SimpleClient(RawClient client)
    {
        try
        {
            _client = client;
            Raw = new WithRawResponseClient(_client);
        }
        catch (Exception ex)
        {
            client.Options.ExceptionHandler?.CaptureException(ex);
            throw;
        }
    }

    public SimpleClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Simple.GetSomethingAsync();
    /// </code></example>
    public async Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await _client
            .Options.ExceptionHandler.TryCatchAsync(async () =>
            {
                await Raw.GetSomethingAsync(options, cancellationToken);
            })
            .ConfigureAwait(false);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> GetSomethingAsync(
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            return await _client
                .Options.ExceptionHandler.TryCatchAsync(async () =>
                {
                    var response = await _client
                        .SendRequestAsync(
                            new JsonRequest
                            {
                                BaseUrl = _client.Options.BaseUrl,
                                Method = HttpMethod.Get,
                                Path = "/get-something",
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
                        throw new SeedOauthClientCredentialsApiException(
                            $"Error with status code {response.StatusCode}",
                            response.StatusCode,
                            responseBody
                        );
                    }
                })
                .ConfigureAwait(false);
        }
    }
}
