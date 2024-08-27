using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using SeedExtends.Core;

#nullable enable

namespace SeedExtends;

public partial class SeedExtendsClient
{
    private RawClient _client;

    public SeedExtendsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExtends" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernextends/0.0.1" },
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
    /// await client.ExtendedInlineRequestBodyAsync(
    ///     new Inlined
    ///     {
    ///         Unique = "string",
    ///         Name = "string",
    ///         Docs = "string",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task ExtendedInlineRequestBodyAsync(
        Inlined request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/extends/extended-inline-request-body",
                Body = request,
                Options = options,
            },
            cancellationToken
        );
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        var responseBody = await response.Raw.Content.ReadAsStringAsync(cancellationToken);
        throw new SeedExtendsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
