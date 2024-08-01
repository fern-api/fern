using System.Net.Http;
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
        GetAttemptedMigrationsRequest request,
        RequestOptions? options = null
    )
    {
        var _headers = new Dictionary<string, string>()
        {
            { "admin-key-header", request.AdminKeyHeader },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/migration-info/all",
                Headers = _headers,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<Migration>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        throw new SeedTraceApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
