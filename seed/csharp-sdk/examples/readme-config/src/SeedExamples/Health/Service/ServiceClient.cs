using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SeedExamples.Health;

public partial class ServiceClient
{
    private SeedExamples.Core.RawClient _client;

    internal ServiceClient(SeedExamples.Core.RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    /// <example><code>
    /// await client.Health.Service.CheckAsync("id-2sdx82h");
    /// </code></example>
    public async Task CheckAsync(
        string id,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "/check/{0}",
                        SeedExamples.Core.ValueConvert.ToPathParameterString(id)
                    ),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    /// <example><code>
    /// await client.Health.Service.PingAsync();
    /// </code></example>
    public async Task<bool> PingAsync(
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/ping",
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
                return SeedExamples.Core.JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
