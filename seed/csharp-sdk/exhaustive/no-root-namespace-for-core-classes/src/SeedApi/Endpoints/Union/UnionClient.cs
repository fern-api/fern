using global::System.Text.Json;
using OneOf;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

public partial class UnionClient : IUnionClient
{
    private readonly RawClient _client;

    internal UnionClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<OneOf<TypesAnimalZero, TypesAnimalOne>>
    > GetAndReturnUnionAsyncCore(
        OneOf<TypesAnimalZero, TypesAnimalOne> request,
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
                var responseData = JsonUtils.Deserialize<OneOf<TypesAnimalZero, TypesAnimalOne>>(
                    responseBody
                )!;
                return new WithRawResponse<OneOf<TypesAnimalZero, TypesAnimalOne>>()
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
    /// await client.Endpoints.Union.GetAndReturnUnionAsync(
    ///     new TypesAnimalZero
    ///     {
    ///         Name = "name",
    ///         LikesToWoof = true,
    ///         Animal = TypesAnimalZeroAnimal.Dog,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<OneOf<TypesAnimalZero, TypesAnimalOne>> GetAndReturnUnionAsync(
        OneOf<TypesAnimalZero, TypesAnimalOne> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<OneOf<TypesAnimalZero, TypesAnimalOne>>(
            GetAndReturnUnionAsyncCore(request, options, cancellationToken)
        );
    }
}
