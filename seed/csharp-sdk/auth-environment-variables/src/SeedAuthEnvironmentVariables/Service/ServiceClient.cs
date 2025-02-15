using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedAuthEnvironmentVariables.Core;

namespace SeedAuthEnvironmentVariables;

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
    /// await client.Service.GetWithApiKeyAsync();
    /// </code>
    /// </example>
    public async Task<string> GetWithApiKeyAsync(
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
                throw new SeedAuthEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedAuthEnvironmentVariablesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <summary>
    /// GET request with custom api key
    /// </summary>
    /// <example>
    /// <code>
    /// await client.Service.GetWithHeaderAsync(
    ///     new HeaderAuthRequest { XEndpointHeader = "X-Endpoint-Header" }
    /// );
    /// </code>
    /// </example>
    public async Task<string> GetWithHeaderAsync(
        HeaderAuthRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = new Headers(
            new Dictionary<string, string>() { { "X-Endpoint-Header", request.XEndpointHeader } }
        );
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "apiKeyInHeader",
                    Headers = _headers,
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
                throw new SeedAuthEnvironmentVariablesException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedAuthEnvironmentVariablesApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
