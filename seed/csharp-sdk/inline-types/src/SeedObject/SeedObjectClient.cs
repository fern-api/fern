using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public partial class SeedObjectClient
{
    private RawClient _client;

    public SeedObjectClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedObject" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferninline-types/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    /// <example>
    /// <code>
    /// await client.GetRootAsync(
    ///     new PostRootRequest
    ///     {
    ///         Bar = new RequestTypeInlineType1 { Foo = "foo" },
    ///         Foo = "foo",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<RootType1> GetRootAsync(
        PostRootRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/root/root",
                Body = request,
                ContentType = "application/json",
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<RootType1>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedObjectException("Failed to deserialize response", e);
            }
        }

        throw new SeedObjectApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.GetDiscriminatedUnionAsync(
    ///     new GetDiscriminatedUnionRequest
    ///     {
    ///         Bar = new DiscriminatedUnion1InlineType1
    ///         {
    ///             Foo = "foo",
    ///             Bar = new DiscriminatedUnion1InlineType1InlineType1
    ///             {
    ///                 Foo = "foo",
    ///                 Ref = new ReferenceType { Foo = "foo" },
    ///             },
    ///             Ref = new ReferenceType { Foo = "foo" },
    ///         },
    ///         Foo = "foo",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task GetDiscriminatedUnionAsync(
        GetDiscriminatedUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/root/discriminated-union",
                Body = request,
                ContentType = "application/json",
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedObjectApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
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
    /// </code>
    /// </example>
    public async Task GetUndiscriminatedUnionAsync(
        GetUndiscriminatedUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/root/undiscriminated-union",
                Body = request,
                ContentType = "application/json",
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        throw new SeedObjectApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
