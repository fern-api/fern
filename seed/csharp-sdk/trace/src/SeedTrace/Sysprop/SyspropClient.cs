using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public partial class SyspropClient : ISyspropClient
{
    private RawClient _client;

    internal SyspropClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public SyspropClient.RawAccessClient Raw { get; }

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
        await Raw.SetNumWarmInstancesAsync(language, numWarmInstances, options, cancellationToken);
    }

    /// <example><code>
    /// await client.Sysprop.GetNumWarmInstancesAsync();
    /// </code></example>
    public async Task<Dictionary<Language, int>> GetNumWarmInstancesAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetNumWarmInstancesAsync(options, cancellationToken);
        return response.Data;
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> SetNumWarmInstancesAsync(
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
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
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

        public async Task<WithRawResponse<Dictionary<Language, int>>> GetNumWarmInstancesAsync(
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
                    var data = JsonUtils.Deserialize<Dictionary<Language, int>>(responseBody)!;
                    return new WithRawResponse<Dictionary<Language, int>>
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
}
