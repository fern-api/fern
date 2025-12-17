using System.Text.Json;
using SeedOauthClientCredentialsReference.Core;

namespace SeedOauthClientCredentialsReference;

public partial class AuthClient
{
    private RawClient _client;

    internal AuthClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Auth.GetTokenAsync(
    ///     new GetTokenRequest { ClientId = "client_id", ClientSecret = "client_secret" }
    /// );
    /// </code></example>
    public async Task<TokenResponse> GetTokenAsync(
        GetTokenRequest request,
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
                    Path = "/token",
                    Body = request,
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
                throw new SeedOauthClientCredentialsReferenceException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedOauthClientCredentialsReferenceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
