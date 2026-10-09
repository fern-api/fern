using global::System.Text.Json;
using SeedCsharpOauthTokenOptional.Core;

namespace SeedCsharpOauthTokenOptional;

public partial class AuthClient : IAuthClient
{
    private readonly RawClient _client;

    internal AuthClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<TokenResponse>> CreateOauth2TokenAsyncCore(
        CreateOauth2TokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedCsharpOauthTokenOptional.Core.QueryStringBuilder.Builder(
            capacity: 0
        )
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedCsharpOauthTokenOptional.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new FormRequest
                {
                    Method = HttpMethod.Post,
                    Path = "/v2/token",
                    Body = request,
                    QueryString = _queryString,
                    Headers = _headers,
                    ContentType = "application/x-www-form-urlencoded",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<TokenResponse>(responseBody)!;
                return new WithRawResponse<TokenResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedCsharpOauthTokenOptional.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpOauthTokenOptionalApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedCsharpOauthTokenOptional.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedCsharpOauthTokenOptionalApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpOauthTokenOptional.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <example><code>
    /// await client.Auth.CreateOauth2TokenAsync(
    ///     new CreateOauth2TokenRequest
    ///     {
    ///         ClientId = "my_oauth_app_123",
    ///         ClientSecret = "sk_live_abcdef123456789",
    ///         GrantType = "client_credentials",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TokenResponse> CreateOauth2TokenAsync(
        CreateOauth2TokenRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TokenResponse>(
            CreateOauth2TokenAsyncCore(request, options, cancellationToken)
        );
    }
}
