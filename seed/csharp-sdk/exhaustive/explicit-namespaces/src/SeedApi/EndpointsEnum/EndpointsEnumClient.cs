using global::System.Text.Json;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.EndpointsEnum;

public partial class EndpointsEnumClient : IEndpointsEnumClient
{
    private readonly RawClient _client;

    internal EndpointsEnumClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<TypesWeatherReport>> EndpointsEnumGetAndReturnEnumAsyncCore(
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
                    responseBody,
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
    /// await client.EndpointsEnum.EndpointsEnumGetAndReturnEnumAsync(TypesWeatherReport.Sunny);
    /// </code></example>
    public WithRawResponseTask<TypesWeatherReport> EndpointsEnumGetAndReturnEnumAsync(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesWeatherReport>(
            EndpointsEnumGetAndReturnEnumAsyncCore(request, options, cancellationToken)
        );
    }
}
