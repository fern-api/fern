using System.Text.Json;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class HomepageClient
{
    private RawClient _client;

    public HomepageClient(RawClient client)
    {
        _client = client;
    }

    public async Task<IEnumerable<string>> GetHomepageProblemsAsync()
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = "/homepage-problems" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<IEnumerable<string>>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async void SetHomepageProblemsAsync(IEnumerable<string> request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/homepage-problems",
                Body = request
            }
        );
    }
}
