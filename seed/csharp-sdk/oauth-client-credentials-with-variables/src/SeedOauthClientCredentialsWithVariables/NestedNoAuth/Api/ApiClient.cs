using SeedOauthClientCredentialsWithVariables;
using SeedOauthClientCredentialsWithVariables.Core;

namespace SeedOauthClientCredentialsWithVariables.NestedNoAuth;

public partial class ApiClient : IApiClient
{
    private RawClient _client;

    internal ApiClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public ApiClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.NestedNoAuth.Api.GetSomethingAsync();
    /// </code></example>
    public async Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.GetSomethingAsync(options, cancellationToken);
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
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/nested-no-auth/get-something",
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
                throw new SeedOauthClientCredentialsWithVariablesApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
