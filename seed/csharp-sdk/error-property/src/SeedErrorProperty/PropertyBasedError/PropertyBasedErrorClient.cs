using System.Text.Json;
using SeedErrorProperty.Core;

namespace SeedErrorProperty;

public partial class PropertyBasedErrorClient : IPropertyBasedErrorClient
{
    private RawClient _client;

    internal PropertyBasedErrorClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> ThrowErrorAsyncCore(
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
                    Path = "property-based-error",
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
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedErrorPropertyApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedErrorPropertyApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    /// <example><code>
    /// await client.PropertyBasedError.ThrowErrorAsync();
    /// </code></example>
    public WithRawResponseTask<string> ThrowErrorAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(ThrowErrorAsyncCore(options, cancellationToken));
    }
}
