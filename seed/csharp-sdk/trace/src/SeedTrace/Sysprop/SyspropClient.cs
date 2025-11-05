using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class SyspropClient
{
    private RawClient _client;

    internal SyspropClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Sysprop.SetNumWarmInstancesAsync(Language.Java, 1);
    /// </code></example>
    public async Task SetNumWarmInstancesAsync(
        Language language,
        int numWarmInstances,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Put,
                    Path = string.Format(
                        "/sysprop/num-warm-instances/{0}/{1}",
                        ValueConvert.ToPathParameterString(language),
                        ValueConvert.ToPathParameterString(numWarmInstances)
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
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Sysprop.GetNumWarmInstancesAsync();
    /// </code></example>
    public async Task<Dictionary<Language, int>> GetNumWarmInstancesAsync(
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
                    Path = "/sysprop/num-warm-instances",
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
                return JsonUtils.Deserialize<Dictionary<Language, int>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedTraceException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedTraceApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
