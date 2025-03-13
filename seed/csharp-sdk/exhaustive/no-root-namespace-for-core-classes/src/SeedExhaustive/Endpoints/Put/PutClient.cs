using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class PutClient
{
    private RawClient _client;

    internal PutClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Endpoints.Put.AddAsync("id", new PutRequest());
    /// </code></example>
    public async Task<PutResponse> AddAsync(
        string id,
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = $"{JsonUtils.SerializeAsString(id)}",
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
                return JsonUtils.Deserialize<PutResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExhaustiveException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
