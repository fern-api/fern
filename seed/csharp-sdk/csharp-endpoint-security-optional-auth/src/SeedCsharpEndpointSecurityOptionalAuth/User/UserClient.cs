using global::System.Text.Json;
using SeedCsharpEndpointSecurityOptionalAuth.Core;

namespace SeedCsharpEndpointSecurityOptionalAuth;

public partial class UserClient : IUserClient
{
    private readonly RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetUserAsyncCore(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString =
            new SeedCsharpEndpointSecurityOptionalAuth.Core.QueryStringBuilder.Builder(capacity: 0)
                .MergeAdditional(options?.AdditionalQueryParameters)
                .Build();
        var _headers =
            await new SeedCsharpEndpointSecurityOptionalAuth.Core.HeadersBuilder.Builder()
                .Add(_client.Options.Headers)
                .Add(_client.Options.GetAuthHeadersForEndpoint(new[] { new[] { "Bearer" } }))
                .Add(_client.Options.AdditionalHeaders)
                .Add(options?.AdditionalHeaders)
                .BuildAsync()
                .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = "user",
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
                {
                    Data = responseData,
                    RawResponse = new SeedCsharpEndpointSecurityOptionalAuth.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpEndpointSecurityOptionalAuthApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedCsharpEndpointSecurityOptionalAuth.RawResponse()
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
            throw new SeedCsharpEndpointSecurityOptionalAuthApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpEndpointSecurityOptionalAuth.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <example><code>
    /// await client.User.GetUserAsync();
    /// </code></example>
    public WithRawResponseTask<User> GetUserAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(GetUserAsyncCore(options, cancellationToken));
    }
}
