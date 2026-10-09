using global::System.Text.Json;
using SeedOauthPkce.Core;

namespace SeedOauthPkce;

public partial class OauthClient : IOauthClient
{
    private readonly RawClient _client;

    internal OauthClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<AuthorizeResponse>> AuthorizeAsyncCore(
        AuthorizeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedOauthPkce.Core.QueryStringBuilder.Builder(capacity: 7)
            .Add("response_type", request.ResponseType)
            .Add("client_id", request.ClientId)
            .Add("redirect_uri", request.RedirectUri)
            .Add("code_challenge", request.CodeChallenge)
            .Add("code_challenge_method", request.CodeChallengeMethod)
            .Add("scope", request.Scope)
            .Add("state", request.State)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedOauthPkce.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = "oauth/authorize",
                    QueryString = _queryString,
                    Headers = _headers,
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
                var responseData = JsonUtils.Deserialize<AuthorizeResponse>(responseBody)!;
                return new WithRawResponse<AuthorizeResponse>()
                {
                    Data = responseData,
                    RawResponse = new SeedOauthPkce.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedOauthPkceApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedOauthPkce.RawResponse()
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
            throw new SeedOauthPkceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedOauthPkce.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <summary>
    /// Authorization-code grant with PKCE. `response_type` is a required literal that is
    /// hardcoded by the generated method; `code_challenge_method` is an optional literal
    /// that must still be sent on the wire when provided.
    /// </summary>
    /// <example><code>
    /// await client.Oauth.AuthorizeAsync(
    ///     new AuthorizeRequest
    ///     {
    ///         ResponseType = "code",
    ///         ClientId = "client_abc123",
    ///         RedirectUri = "https://example.com/callback",
    ///         CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    ///         CodeChallengeMethod = "S256",
    ///         Scope = "read write",
    ///         State = "xyz",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<AuthorizeResponse> AuthorizeAsync(
        AuthorizeRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<AuthorizeResponse>(
            AuthorizeAsyncCore(request, options, cancellationToken)
        );
    }
}
