using SeedAlias.Core;

namespace SeedAlias;

public partial class SeedAliasClient : ISeedAliasClient
{
    private readonly RawClient _client;

    public SeedAliasClient (ClientOptions? clientOptions = null){
        var defaultHeaders = new Headers(new Dictionary<string, string>(){
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedAlias" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernalias/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders){
            if (!clientOptions.Headers.ContainsKey(header.Key)){
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = 
        new RawClient(clientOptions);
        Raw = new RawAccessClient(_client);
    }

    public SeedAliasClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.GetAsync("typeId");
    /// </code></example>
    public async Task GetAsync(string typeId, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/{0}", ValueConvert.ToPathParameterString(typeId)), Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedAliasApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;
        internal RawAccessClient (RawClient client){
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(HttpResponseMessage response) {
            var headers = new Dictionary<string, IEnumerable<string>>(StringComparer.OrdinalIgnoreCase);
            foreach (var header in response.Headers)
            {
                headers[header.Key] = header.Value.ToList();
            }
            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                {
                    headers[header.Key] = header.Value.ToList();
                }
            }
            return headers;
        }

        public async Task<RawResponse<object>> GetAsync(string typeId, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = string.Format("/{0}", ValueConvert.ToPathParameterString(typeId)), Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return new RawResponse<object>
                {
                    StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                    Url = response.Raw.RequestMessage?.RequestUri!,
                    Headers = ExtractHeaders(response.Raw),
                    Body = new object()
                }
                };
            }
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedAliasApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
