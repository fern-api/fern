using System.Net.Http;
using System.Text.Json;
using SeedSingleUrlEnvironmentDefault.Core;

#nullable enable

namespace SeedSingleUrlEnvironmentDefault;

public class DummyClient
{
    private RawClient _client;

    public DummyClient(RawClient client)
    {
        _client = client;
    }

    public async Task<string> GetDummyAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "dummy",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedSingleUrlEnvironmentDefaultException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedSingleUrlEnvironmentDefaultApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
