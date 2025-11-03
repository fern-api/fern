using SeedAliasExtends.Core;

namespace SeedAliasExtends;

public partial class SeedAliasExtendsClient
{
    private readonly RawClient _client;

    public SeedAliasExtendsClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedAliasExtends" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernalias-extends/0.0.1" },
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

    /// <example><code>
    /// await client.ExtendedInlineRequestBodyAsync(
    ///     new InlinedChildRequest { Child = "child", Parent = "parent" }
    /// );
    /// </code></example>
    public async Task ExtendedInlineRequestBodyAsync(
        InlinedChildRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/extends/extended-inline-request-body",
                    Body = request,
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedAliasExtendsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
