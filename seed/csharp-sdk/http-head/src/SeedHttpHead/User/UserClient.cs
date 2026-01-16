using SeedHttpHead.Core;
using System.Net.Http.Headers;
using System.Text.Json;

namespace SeedHttpHead;

public partial class UserClient : IUserClient
{
    private RawClient _client;

    internal UserClient (RawClient client){
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public UserClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.User.HeadAsync();
    /// </code></example>
    public async Task<HttpResponseHeaders> HeadAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Head, Path = "/users", Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return response.Raw.Headers;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedHttpHeadApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
        }
    }

    /// <example><code>
    /// await client.User.ListAsync(new ListUsersRequest { Limit = 1 });
    /// </code></example>
    public async Task<IEnumerable<User>> ListAsync(ListUsersRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
        var _query = new Dictionary<string, object>();
        _query["limit"] = request.Limit.ToString();
        var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/users", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                return JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedHttpHeadException("Failed to deserialize response", e);
            }
        }
        
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedHttpHeadApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
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

        public async Task<RawResponse<HttpResponseHeaders>> HeadAsync(RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Head, Path = "/users", Options = options}, cancellationToken).ConfigureAwait(false);
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
                throw new SeedHttpHeadApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

        public async Task<RawResponse<IEnumerable<User>>> ListAsync(ListUsersRequest request, RequestOptions? options = null, CancellationToken cancellationToken = default) {
            var _query = new Dictionary<string, object>();
            _query["limit"] = request.Limit.ToString();
            var response = await _client.SendRequestAsync(new JsonRequest {BaseUrl = _client.Options.BaseUrl, Method = HttpMethod.Get, Path = "/users", Query = _query, Options = options}, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
                    return new RawResponse<IEnumerable<User>>
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
                    throw new SeedHttpHeadException("Failed to deserialize response", e);
                }
            }
            
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedHttpHeadApiException($"Error with status code {response.StatusCode}", response.StatusCode, responseBody);
            }
        }

    }

}
