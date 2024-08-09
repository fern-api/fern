using System.Net.Http;
using SeedFileDownload.Core;

#nullable enable

namespace SeedFileDownload;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    public async Task DownloadFileAsync(RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedFileDownloadApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
