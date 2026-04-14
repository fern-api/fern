using global::System.Text.Json;
using SeedObject.Core;

namespace SeedObject;

public partial class SeedObjectClient : ISeedObjectClient
{
    private readonly RawClient _client;

    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedObject" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-inline-types/0.0.1" },
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

    private async Task<WithRawResponse<RootType1>> GetRootAsyncCore(
        PostRootRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedObject.Core.HeadersBuilder.Builder()
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
                    Path = "/root/root",
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
                var responseData = JsonUtils.Deserialize<RootType1>(responseBody)!;
                return new WithRawResponse<RootType1>()
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
                throw new SeedObjectApiException(
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
            throw new SeedObjectApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.GetRootAsync(
    ///     new PostRootRequest
    ///     {
    ///         Bar = new RequestTypeInlineType1 { Foo = "foo" },
    ///         Foo = "foo",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<RootType1> GetRootAsync(
        PostRootRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<RootType1>(
            GetRootAsyncCore(request, options, cancellationToken)
        );
    }

    /// <example><code>
    /// await client.GetDiscriminatedUnionAsync(
    ///     new GetDiscriminatedUnionRequest
    ///     {
    ///         Bar = new DiscriminatedUnion1(
    ///             new DiscriminatedUnion1.Type1(
    ///                 new DiscriminatedUnion1InlineType1
    ///                 {
    ///                     Foo = "foo",
    ///                     Bar = new DiscriminatedUnion1InlineType1InlineType1
    ///                     {
    ///                         Foo = "foo",
    ///                         Ref = new ReferenceType { Foo = "foo" },
    ///                     },
    ///                     Ref = new ReferenceType { Foo = "foo" },
    ///                 }
    ///             )
    ///         ),
    ///         Foo = "foo",
    ///     }
    /// );
    /// </code></example>
    public async Task GetDiscriminatedUnionAsync(
        GetDiscriminatedUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedObject.Core.HeadersBuilder.Builder()
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
                    Path = "/root/discriminated-union",
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
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedObjectApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.GetUndiscriminatedUnionAsync(
    ///     new GetUndiscriminatedUnionRequest
    ///     {
    ///         Bar = new UndiscriminatedUnion1InlineType1
    ///         {
    ///             Foo = "foo",
    ///             Bar = new UndiscriminatedUnion1InlineType1InlineType1
    ///             {
    ///                 Foo = "foo",
    ///                 Ref = new ReferenceType { Foo = "foo" },
    ///             },
    ///             Ref = new ReferenceType { Foo = "foo" },
    ///         },
    ///         Foo = "foo",
    ///     }
    /// );
    /// </code></example>
    public async Task GetUndiscriminatedUnionAsync(
        GetUndiscriminatedUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedObject.Core.HeadersBuilder.Builder()
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
                    Path = "/root/undiscriminated-union",
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
            return;
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedObjectApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
