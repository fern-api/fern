using System.Net.Http;
using System.Text.Json;
using SeedCustomAuth.Core;

#nullable enable

namespace SeedCustomAuth;

public class CustomAuthClient
{
    private RawClient _client;

    public CustomAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with custom auth scheme
    /// </summary>
    public async Task<bool> GetWithCustomAuthAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "custom-auth" }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<bool>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// POST request with custom auth scheme
    /// </summary>
    public async Task<bool> PostWithCustomAuthAsync(object request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "custom-auth",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<bool>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
