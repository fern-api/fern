using System.Net.Http;
using System.Text.Json;
using SeedBasicAuth.Core;

#nullable enable

namespace SeedBasicAuth;

public class BasicAuthClient
{
    private RawClient _client;

    public BasicAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with basic auth scheme
    /// </summary>
    public async Task<bool> GetWithBasicAuthAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "basic-auth" }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<bool>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    /// <summary>
    /// POST request with basic auth scheme
    /// </summary>
    public async Task<bool> PostWithBasicAuthAsync(object request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "basic-auth",
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
