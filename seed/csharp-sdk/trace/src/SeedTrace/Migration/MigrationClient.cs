using System.Text.Json;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class MigrationClient
{
    private RawClient _client;

    public MigrationClient(RawClient client)
    {
        _client = client;
    }

    public async Task<IEnumerable<Migration>> GetAttemptedMigrationsAsync(
        GetAttemptedMigrationsRequest request
    )
    {
        var _headers = new Dictionary<string, string>()
        {
            { "admin-key-header", request.AdminKeyHeader },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Get,
                Path = "/migration-info/all",
                Headers = _headers
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<IEnumerable<Migration>>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
