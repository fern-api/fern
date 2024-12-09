using System.Net.Http;
using System.Text.Json;
using System.Threading;
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
    ///         Bar = new InlineType1
    ///         {
    ///             Foo = "foo",
    ///             Bar = new NestedInlineType1
    ///             {
    ///                 Foo = "foo",
    ///                 Bar = "bar",
    ///                 MyEnum = InlineEnum.Sunny,
    ///             },
    ///         },
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
}
