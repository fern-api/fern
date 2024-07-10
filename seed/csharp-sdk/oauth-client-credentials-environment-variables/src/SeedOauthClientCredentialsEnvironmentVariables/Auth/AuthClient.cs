using System.Net.Http;
using System.Text.Json;
using SeedOauthClientCredentialsEnvironmentVariables;
using SeedOauthClientCredentialsEnvironmentVariables.Core;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables;

public class AuthClient
{
    private RawClient _client;

    public AuthClient(RawClient client)
    {
        _client = client;
    }

    public async Task<TokenResponse> GetTokenWithClientCredentialsAsync(GetTokenRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/token",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<TokenResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/token",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<TokenResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
