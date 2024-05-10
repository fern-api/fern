using System.Text.Json;
using SeedTrace;

namespace SeedTrace;

public class MigrationClient
{
    private RawClient _client;

    public MigrationClient(RawClient client)
    {
        _client = client;
    }

    public async Task<List<Migration>> GetAttemptedMigrationsAsync(
        GetAttemptedMigrationsRequest request
    )
    {
        var _headers = new Dictionary<string, string>()
        {
            { "admin-key-header", request.AdminKeyHeader },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/all",
                Headers = _headers
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<Migration>>(responseBody);
        }
        throw new Exception();
    }
}
