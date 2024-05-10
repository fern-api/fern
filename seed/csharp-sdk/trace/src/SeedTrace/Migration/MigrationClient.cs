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

    public async List<List<Migration>> GetAttemptedMigrationsAsync(
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
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<List<Migration>>>(responseBody);
        }
        throw new Exception();
    }
}
