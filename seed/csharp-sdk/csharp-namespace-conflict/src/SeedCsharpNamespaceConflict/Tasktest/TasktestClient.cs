using System.Net.Http;
using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict;

public partial class TasktestClient
{
    private RawClient _client;

    internal TasktestClient(RawClient client)
    {
        _client = client;
    }

    public async Task HelloAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "hello",
                Options = options
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedCsharpNamespaceConflictApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
