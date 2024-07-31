using System.Net.Http;
using SeedApi.Core;
using SeedApi.Folder;

#nullable enable

namespace SeedApi.Folder;

public class FolderClient
{
    private RawClient _client;

    public FolderClient(RawClient client)
    {
        _client = client;
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; }

    public async Task FooAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = ""
            }
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedApiApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
