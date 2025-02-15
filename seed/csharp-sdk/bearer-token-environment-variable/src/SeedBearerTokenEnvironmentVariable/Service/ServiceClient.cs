using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedBearerTokenEnvironmentVariable.Core;

namespace SeedBearerTokenEnvironmentVariable;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Service.GetWithBearerTokenAsync();
    /// </code>
    /// </example>
    public async Task<string> GetWithBearerTokenAsync(
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
                    Path = "apiKey",
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
                throw new SeedBearerTokenEnvironmentVariableException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedBearerTokenEnvironmentVariableApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
