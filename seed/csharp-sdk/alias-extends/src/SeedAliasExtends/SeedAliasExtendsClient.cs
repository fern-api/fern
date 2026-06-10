using SeedAliasExtends.Core;

namespace SeedAliasExtends;

public partial class SeedAliasExtendsClient : ISeedAliasExtendsClient
{
    private readonly RawClient _client;

    public SeedAliasExtendsClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedAliasExtends" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernalias-extends/0.0.1" },
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

    private async Task<RawResponse> ExtendedInlineRequestBodyAsyncCore(
        InlinedChildRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedAliasExtends.Core.HeadersBuilder.Builder()
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
                    Path = "/extends/extended-inline-request-body",
                    Body = request,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedAliasExtendsApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.ExtendedInlineRequestBodyAsync(
    ///     new InlinedChildRequest { Child = "child", Parent = "parent" }
    /// );
    /// </code></example>
    public WithRawResponseTask ExtendedInlineRequestBodyAsync(
        InlinedChildRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(
            ExtendedInlineRequestBodyAsyncCore(request, options, cancellationToken)
        );
    }
}
