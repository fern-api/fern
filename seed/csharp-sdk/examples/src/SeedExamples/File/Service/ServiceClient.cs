using System.Text.Json;
using SeedExamples;
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
    public async Task<File> GetFileAsync(string filename, GetFileRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/file/{filename}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<File>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
