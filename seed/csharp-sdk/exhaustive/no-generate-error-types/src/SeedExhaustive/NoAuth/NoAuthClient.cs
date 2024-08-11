using System.Net.Http;
using System.Text.Json;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive;

public partial class NoAuthClient
{
    private RawClient _client;

    internal NoAuthClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// POST request with no auth
    /// </summary>
    public async Task<bool> PostWithNoAuthAsync(object request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/no-auth",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        throw new SeedExhaustiveApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
