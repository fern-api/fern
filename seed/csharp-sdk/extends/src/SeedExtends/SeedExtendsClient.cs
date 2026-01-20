using SeedExtends.Core;

namespace SeedExtends;

public partial class SeedExtendsClient : ISeedExtendsClient
{
    private readonly RawClient _client;

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
        Raw = new WithRawResponseClient(_client);
    }

    public SeedExtendsClient.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.ExtendedInlineRequestBodyAsync(
    ///     new Inlined
    ///     {
    ///         Unique = "unique",
    ///         Name = "name",
    ///         Docs = "docs",
    ///     }
    /// );
    /// </code></example>
    public async Task ExtendedInlineRequestBodyAsync(
        Inlined request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        await Raw.ExtendedInlineRequestBodyAsync(request, options, cancellationToken);
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<object>> ExtendedInlineRequestBodyAsync(
            Inlined request,
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
                return new WithRawResponse<object>
                {
                    Data = new object(),
                    RawResponse = new RawResponse
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedExtendsApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
