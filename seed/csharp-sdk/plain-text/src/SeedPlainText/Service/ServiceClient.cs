using System.Net.Http;
using SeedPlainText.Core;

#nullable enable

namespace SeedPlainText;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task GetTextAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "text",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedPlainTextApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
