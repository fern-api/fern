using System.Text.Json;
using SeedInferredAuthImplicitApiKey.Core;

namespace SeedInferredAuthImplicitApiKey;

public partial class AuthClient : IAuthClient
{
    private RawClient _client;

    internal AuthClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public AuthClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Auth.GetTokenAsync(new GetTokenRequest { ApiKey = "api_key" });
    /// </code></example>
    public async Task<TokenResponse> GetTokenAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetTokenAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<TokenResponse>> GetTokenAsync(
            GetTokenRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _headers = new Headers(
                new Dictionary<string, string>() { { "X-Api-Key", request.ApiKey } }
            );
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "/token",
                        Headers = _headers,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var data = JsonUtils.Deserialize<TokenResponse>(responseBody)!;
                    return new WithRawResponse<TokenResponse>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedInferredAuthImplicitApiKeyException(
                        "Failed to deserialize response",
                        e
                    );
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedInferredAuthImplicitApiKeyApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
