using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Enum;

namespace SeedExhaustive.Endpoints.Enum;

public partial class EnumClient : IEnumClient
{
    private RawClient _client;

    internal EnumClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public EnumClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.Endpoints.Enum.GetAndReturnEnumAsync(WeatherReport.Sunny);
    /// </code></example>
    public async Task<WeatherReport> GetAndReturnEnumAsync(
        WeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetAndReturnEnumAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<WeatherReport>> GetAndReturnEnumAsync(
            WeatherReport request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "/enum",
                        Body = request,
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
                    var data = JsonUtils.Deserialize<WeatherReport>(responseBody)!;
                    return new WithRawResponse<WeatherReport>
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
}
