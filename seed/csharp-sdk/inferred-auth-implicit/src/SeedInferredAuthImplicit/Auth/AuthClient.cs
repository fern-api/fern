using System.Text.Json;
using SeedInferredAuthImplicit.Core;

namespace SeedInferredAuthImplicit;

public partial class AuthClient : IAuthClient
{
    private RawClient _client;

    internal AuthClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<TokenResponse>> GetTokenWithClientCredentialsAsyncCore(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>() { { "X-Api-Key", request.XApiKey } }
        );
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/token",
                    Body = request,
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
                var responseData = JsonUtils.Deserialize<TokenResponse>(responseBody)!;
                return new WithRawResponse<TokenResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedInferredAuthImplicitApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedInferredAuthImplicitApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<TokenResponse>> RefreshTokenAsyncCore(
        RefreshTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>() { { "X-Api-Key", request.XApiKey } }
        );
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/token/refresh",
                    Body = request,
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
                var responseData = JsonUtils.Deserialize<TokenResponse>(responseBody)!;
                return new WithRawResponse<TokenResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedInferredAuthImplicitApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedInferredAuthImplicitApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Auth.GetTokenWithClientCredentialsAsync(
    ///     new GetTokenRequest
    ///     {
    ///         XApiKey = "X-Api-Key",
    ///         ClientId = "client_id",
    ///         ClientSecret = "client_secret",
    ///         Audience = "https://api.example.com",
    ///         GrantType = "client_credentials",
    ///         Scope = "scope",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TokenResponse> GetTokenWithClientCredentialsAsync(
        GetTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TokenResponse>(
            GetTokenWithClientCredentialsAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.Auth.RefreshTokenAsync(
    ///     new RefreshTokenRequest
    ///     {
    ///         XApiKey = "X-Api-Key",
    ///         ClientId = "client_id",
    ///         ClientSecret = "client_secret",
    ///         RefreshToken = "refresh_token",
    ///         Audience = "https://api.example.com",
    ///         GrantType = "refresh_token",
    ///         Scope = "scope",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TokenResponse> RefreshTokenAsync(
        RefreshTokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TokenResponse>(
            RefreshTokenAsyncCore(request, options, cancellationToken)
        );
    }
}
