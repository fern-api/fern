using System.Net.Http;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.File;

#nullable enable

namespace SeedExamples.File;

public class ServiceClient
{
    private RawClient _client;

    public ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint returns a file by its name.
    /// </summary>
    public async Task<File> GetFileAsync(
        string filename,
        GetFileRequest request,
        RequestOptions? options
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = options?.BaseUrl ?? _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = $"/file/{filename}",
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<File>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
