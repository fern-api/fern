using System.Text.Json;
using SeedUndiscriminatedUnionWithResponseProperty.Core;

namespace SeedUndiscriminatedUnionWithResponseProperty;

public partial class SeedUndiscriminatedUnionWithResponsePropertyClient
{
    private readonly RawClient _client;

    public SeedUndiscriminatedUnionWithResponsePropertyClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedUndiscriminatedUnionWithResponseProperty" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernundiscriminated-union-with-response-property/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    /// <example><code>
    /// await client.GetUnionAsync();
    /// </code></example>
    public async Task<UnionResponse> GetUnionAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/union",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<UnionResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUndiscriminatedUnionWithResponsePropertyException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionWithResponsePropertyApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.ListUnionsAsync();
    /// </code></example>
    public async Task<UnionListResponse> ListUnionsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/unions",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<UnionListResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUndiscriminatedUnionWithResponsePropertyException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedUndiscriminatedUnionWithResponsePropertyApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
