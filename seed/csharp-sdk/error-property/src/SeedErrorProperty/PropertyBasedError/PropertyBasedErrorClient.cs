using System.Text.Json;
using SeedErrorProperty.Core;

namespace SeedErrorProperty;

public partial class PropertyBasedErrorClient : IPropertyBasedErrorClient
{
    private RawClient _client;

    internal PropertyBasedErrorClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public PropertyBasedErrorClient.RawAccessClient Raw { get; }

    /// <summary>
    /// GET request that always throws an error
    /// </summary>
    /// <example><code>
    /// await client.PropertyBasedError.ThrowErrorAsync();
    /// </code></example>
    public async Task<string> ThrowErrorAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.ThrowErrorAsync(options, cancellationToken);
        return response.Data;
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        /// <summary>
        /// GET request that always throws an error
        /// </summary>
        public async Task<WithRawResponse<string>> ThrowErrorAsync(
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
                    var data = JsonUtils.Deserialize<string>(responseBody)!;
                    return new WithRawResponse<string>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedErrorPropertyException("Failed to deserialize response", e);
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
    }
}
