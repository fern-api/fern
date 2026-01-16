using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public partial class UsersClient : IUsersClient
{
    private RawClient _client;

    internal UsersClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public UsersClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Users.ListUsernamesCustomAsync(
    ///     new ListUsernamesRequestCustom { StartingAfter = "starting_after" }
    /// );
    /// </code></example>
    public async Task<SeedPaginationPager<string>> ListUsernamesCustomAsync(
        ListUsernamesRequestCustom request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var httpRequest = await _client.CreateHttpRequestAsync(
            new JsonRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query,
                Options = options,
            }
        );
        var sendRequest = async (
            HttpRequestMessage httpRequest,
            CancellationToken cancellationToken
        ) =>
        {
            var response = await _client
                .SendRequestAsync(httpRequest, options, cancellationToken)
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                return response.Raw;
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedPaginationApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        };
        return await SeedPaginationPagerFactory
            .CreateAsync<string>(
                new SeedPaginationPagerContext()
                {
                    SendRequest = sendRequest,
                    InitialHttpRequest = httpRequest,
                    ClientOptions = _client.Options,
                    RequestOptions = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        private static IReadOnlyDictionary<string, IEnumerable<string>> ExtractHeaders(
            HttpResponseMessage response
        )
        {
            var headers = new Dictionary<string, IEnumerable<string>>(
                StringComparer.OrdinalIgnoreCase
            );
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

        public async Task<RawResponse<UsernameCursor>> ListUsernamesCustomAsync(
            ListUsernamesRequestCustom request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            if (request.StartingAfter != null)
            {
                _query["starting_after"] = request.StartingAfter;
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "/users",
                        Query = _query,
                        Options = options,
                    },
                    cancellationToken
                )
                .ConfigureAwait(false);
            if (response.StatusCode is >= 200 and < 400)
            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                try
                {
                    var body = JsonUtils.Deserialize<UsernameCursor>(responseBody)!;
                    return new RawResponse<UsernameCursor>
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = new ResponseHeaders(ExtractHeaders(response.Raw)),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedPaginationException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedPaginationApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
