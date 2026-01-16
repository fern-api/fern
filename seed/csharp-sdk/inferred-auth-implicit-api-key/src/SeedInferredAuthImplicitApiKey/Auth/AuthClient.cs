using System.Text.Json;
using SeedInferredAuthImplicitApiKey.Core;

namespace SeedInferredAuthImplicitApiKey;

public partial class AuthClient : IAuthClient
{
    private RawClient _client;

    internal AuthClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public AuthClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Auth.GetTokenAsync(new GetTokenRequest { ApiKey = "api_key" });
    /// </code></example>
    public async Task<TokenResponse> GetTokenAsync(
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
                return JsonUtils.Deserialize<TokenResponse>(responseBody)!;
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

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        public async Task<RawResponse<TokenResponse>> GetTokenAsync(
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
                    var body = JsonUtils.Deserialize<TokenResponse>(responseBody)!;
                    return new RawResponse<TokenResponse>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
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
