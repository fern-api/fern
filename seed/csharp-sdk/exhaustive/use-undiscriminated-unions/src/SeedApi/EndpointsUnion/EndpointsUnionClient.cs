using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class EndpointsUnionClient : IEndpointsUnionClient
{
    private readonly RawClient _client;

    internal EndpointsUnionClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<TypesAnimal>> EndpointsUnionGetAndReturnUnionAsyncCore(
        TypesAnimal request,
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
                    Path = "union",
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
                var responseData = JsonUtils.Deserialize<TypesAnimal>(responseBody)!;
                return new WithRawResponse<TypesAnimal>()
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
    /// await client.EndpointsUnion.EndpointsUnionGetAndReturnUnionAsync(
    ///     new TypesAnimalZero
    ///     {
    ///         Name = "name",
    ///         LikesToWoof = true,
    ///         Animal = TypesAnimalZeroAnimal.Dog,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<TypesAnimal> EndpointsUnionGetAndReturnUnionAsync(
        TypesAnimal request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TypesAnimal>(
            EndpointsUnionGetAndReturnUnionAsyncCore(request, options, cancellationToken)
        );
    }
}
