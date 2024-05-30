using System.Text.Json;
using SeedOauthClientCredentials;
using SeedOauthClientCredentials.Auth;

#nullable enable

namespace SeedOauthClientCredentials.Auth;

public class AuthClient
{
    private RawClient _client;

    public AuthClient(RawClient client)
    {
        _client = client;
    }

    public async Task<TokenResponse> GetTokenAsync(GetTokenRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/token",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<TokenResponse>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
