using global::System.Text.Json;
using SeedCsharpUnionBaseProperties.Core;

namespace SeedCsharpUnionBaseProperties;

public partial class SeedCsharpUnionBasePropertiesClient : ISeedCsharpUnionBasePropertiesClient
{
    private readonly RawClient _client;

    public SeedCsharpUnionBasePropertiesClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpUnionBaseProperties" },
                { "X-Fern-SDK-Version", global::SeedCsharpUnionBaseProperties.Version.Current },
                { "User-Agent", "Ferncsharp-union-base-properties/0.0.1" },
            }
        );
        foreach (var header in platformHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    private async Task<WithRawResponse<Shape>> CreateAsyncCore(
        Shape request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedCsharpUnionBaseProperties.Core.QueryStringBuilder.Builder(
            capacity: 0
        )
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedCsharpUnionBaseProperties.Core.HeadersBuilder.Builder()
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
                    Path = "/shapes",
                    Body = request,
                    QueryString = _queryString,
                    Headers = _headers,
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
                var responseData = JsonUtils.Deserialize<Shape>(responseBody)!;
                return new WithRawResponse<Shape>()
                {
                    Data = responseData,
                    RawResponse = new SeedCsharpUnionBaseProperties.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedCsharpUnionBasePropertiesApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e,
                    rawResponse: new SeedCsharpUnionBaseProperties.RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    }
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedCsharpUnionBasePropertiesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody,
                rawResponse: new SeedCsharpUnionBaseProperties.RawResponse()
                {
                    StatusCode = response.Raw.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                    Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                }
            );
        }
    }

    /// <example><code>
    /// await client.CreateAsync(
    ///     new Shape(new Shape.Circle(new Circle { Radius = 1.5 }))
    ///     {
    ///         Id = "shape-1",
    ///         CreatedAt = "2024-01-01T00:00:00Z",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<Shape> CreateAsync(
        Shape request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<Shape>(CreateAsyncCore(request, options, cancellationToken));
    }
}
