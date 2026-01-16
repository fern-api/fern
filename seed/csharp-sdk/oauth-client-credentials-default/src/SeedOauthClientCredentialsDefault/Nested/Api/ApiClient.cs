using SeedOauthClientCredentialsDefault.Core;
using SeedOauthClientCredentialsDefault;

namespace SeedOauthClientCredentialsDefault.Nested;

public partial class ApiClient : IApiClient
{
    private RawClient _client;

    internal ApiClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public ApiClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Nested.Api.GetSomethingAsync();
    /// </code></example>
    public async Task GetSomethingAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/nested/get-something", Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedOauthClientCredentialsDefaultApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        public async Task<RawResponse<object>> GetSomethingAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/nested/get-something", Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedOauthClientCredentialsDefaultApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
