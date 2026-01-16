using SeedCsharpXmlEntities.Core;
using System.Text.Json;

namespace SeedCsharpXmlEntities;

public partial class SeedCsharpXmlEntitiesClient : ISeedCsharpXmlEntitiesClient
{
    private readonly RawClient _client;

    public SeedCsharpXmlEntitiesClient (ClientOptions? clientOptions = null){
        var defaultHeaders = new Headers(new Dictionary<string, string>(){
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpXmlEntities" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-xml-entities/0.0.1" },
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

    public SeedCsharpXmlEntitiesClient.RawAccessClient Raw { get; }

    /// <summary>
    /// Get timezone information with + offset
    /// </summary>
    /// <example><code>
    /// await client.GetTimeZoneAsync();
    /// </code></example>
    public async Task<TimeZoneModel> GetTimeZoneAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/timezone", Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<TimeZoneModel>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCsharpXmlEntitiesException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpXmlEntitiesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        /// <summary>
        /// Get timezone information with + offset
        /// </summary>
        public async Task<RawResponse<TimeZoneModel>> GetTimeZoneAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/timezone", Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<TimeZoneModel>(responseBody)!;
                    return new RawResponse<TimeZoneModel>
                    {
                        StatusCode = (System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body
                    }
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedCsharpXmlEntitiesException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedCsharpXmlEntitiesApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
