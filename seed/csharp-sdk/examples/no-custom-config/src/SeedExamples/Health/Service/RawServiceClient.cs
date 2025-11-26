using System.Text.Json;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Health;

public partial class RawServiceClient
{
    private RawClient _client;

    internal RawServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <summary>
    /// This endpoint checks the health of a resource.
    /// </summary>
    public async Task<RawResponse<object>> CheckAsync(
        string id,
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
                    Path = string.Format("/check/{0}", ValueConvert.ToPathParameterString(id)),
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new RawResponse<object>
            {
                Body = null!,
                StatusCode = response.StatusCode,
                Headers = response.Raw.Headers,
            };
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// This endpoint checks the health of the service.
    /// </summary>
    public async Task<RawResponse<bool>> PingAsync(
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
                var body = JsonUtils.Deserialize<bool>(responseBody)!;
                return new RawResponse<bool>
                {
                    Body = body,
                    StatusCode = response.StatusCode,
                    Headers = response.Raw.Headers,
                };
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
