using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernschemaless-request-body-examples/0.0.1" },
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

    private async Task<WithRawResponse<CreatePlantResponse>> CreatePlantAsyncCore(
        object request,
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
                    Path = "plants",
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
                var responseData = JsonUtils.Deserialize<CreatePlantResponse>(responseBody)!;
                return new WithRawResponse<CreatePlantResponse>()
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

    private async Task<WithRawResponse<UpdatePlantResponse>> UpdatePlantAsyncCore(
        UpdatePlantRequest request,
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
                    Method = HttpMethod.Put,
                    Path = string.Format(
                        "plants/{0}",
                        ValueConvert.ToPathParameterString(request.PlantId)
                    ),
                    Body = request.Body,
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
                var responseData = JsonUtils.Deserialize<UpdatePlantResponse>(responseBody)!;
                return new WithRawResponse<UpdatePlantResponse>()
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

    private async Task<
        WithRawResponse<CreatePlantWithSchemaResponse>
    > CreatePlantWithSchemaAsyncCore(
        CreatePlantWithSchemaRequest request,
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
                    Path = "plants/with-schema",
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
                var responseData = JsonUtils.Deserialize<CreatePlantWithSchemaResponse>(
                    responseBody
                )!;
                return new WithRawResponse<CreatePlantWithSchemaResponse>()
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

    /// <summary>
    /// Creates a plant with example JSON but no request body schema.
    /// </summary>
    /// <example><code>
    /// await client.CreatePlantAsync(
    ///     new Dictionary&lt;object, object?&gt;()
    ///     {
    ///         {
    ///             "care",
    ///             new Dictionary&lt;object, object?&gt;()
    ///             {
    ///                 { "humidity", "high" },
    ///                 { "light", "full sun" },
    ///                 { "water", "distilled only" },
    ///             }
    ///         },
    ///         { "name", "Venus Flytrap" },
    ///         { "species", "Dionaea muscipula" },
    ///         {
    ///             "tags",
    ///             new List&lt;object?&gt;() { "carnivorous", "tropical" }
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<CreatePlantResponse> CreatePlantAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CreatePlantResponse>(
            CreatePlantAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// Updates a plant with example JSON but no request body schema.
    /// </summary>
    /// <example><code>
    /// await client.UpdatePlantAsync(
    ///     new UpdatePlantRequest
    ///     {
    ///         PlantId = "plantId",
    ///         Body = new Dictionary&lt;object, object?&gt;()
    ///         {
    ///             {
    ///                 "care",
    ///                 new Dictionary&lt;object, object?&gt;() { { "light", "partial shade" } }
    ///             },
    ///             { "name", "Updated Venus Flytrap" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<UpdatePlantResponse> UpdatePlantAsync(
        UpdatePlantRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<UpdatePlantResponse>(
            UpdatePlantAsyncCore(request, options, cancellationToken)
        );
    }

    /// <summary>
    /// A control endpoint that has both schema and example defined.
    /// </summary>
    /// <example><code>
    /// await client.CreatePlantWithSchemaAsync(
    ///     new CreatePlantWithSchemaRequest { Name = "Sundew", Species = "Drosera capensis" }
    /// );
    /// </code></example>
    public WithRawResponseTask<CreatePlantWithSchemaResponse> CreatePlantWithSchemaAsync(
        CreatePlantWithSchemaRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<CreatePlantWithSchemaResponse>(
            CreatePlantWithSchemaAsyncCore(request, options, cancellationToken)
        );
    }
}
