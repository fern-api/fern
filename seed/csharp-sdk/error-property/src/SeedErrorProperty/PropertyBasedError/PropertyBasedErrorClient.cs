using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedErrorProperty.Core;

namespace SeedErrorProperty;

public partial class PropertyBasedErrorClient
{
    private RawClient _client;

    internal PropertyBasedErrorClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    /// <example>
    /// <code>
    /// await client.PropertyBasedError.ThrowErrorAsync();
    /// </code>
    /// </example>
    public async Task<string> ThrowErrorAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "property-based-error",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedErrorPropertyException("Failed to deserialize response", e);
            }
        }

        throw new SeedErrorPropertyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
