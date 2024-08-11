using System.Net.Http;
using System.Text.Json;
using SeedOauthClientCredentialsEnvironmentVariables.Core;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables;

public partial class AuthClient
{
    private RawClient _client;

    internal AuthClient(RawClient client)
    {
        _client = client;
    }

    public async Task<TokenResponse> GetTokenWithClientCredentialsAsync(
        GetTokenRequest request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/token",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<TokenResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedOauthClientCredentialsEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedOauthClientCredentialsEnvironmentVariablesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    public async Task<TokenResponse> RefreshTokenAsync(
        RefreshTokenRequest request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/token",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<TokenResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedOauthClientCredentialsEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedOauthClientCredentialsEnvironmentVariablesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
