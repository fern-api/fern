using global::System.Text.Json;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial class EnumClient : IEnumClient
{
    private readonly RawClient _client;

    internal EnumClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<TypesWeatherReport>> GetAndReturnEnumAsyncCore(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = "enum",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<TypesWeatherReport>(responseBody)!;
                return new WithRawResponse<TypesWeatherReport>()
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
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    null,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Endpoints.Enum.GetAndReturnEnumAsync(TypesWeatherReport.Sunny);
    /// </code></example>
    public WithRawResponseTask<TypesWeatherReport> GetAndReturnEnumAsync(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesWeatherReport>(
            GetAndReturnEnumAsyncCore(request, options, cancellationToken)
        );
    }
}
