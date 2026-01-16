using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernquery-parameters-openapi/0.0.1" },
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
        Raw = new RawAccessClient(_client);
    }

    public SeedApiClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.SearchAsync(
    ///     new SearchRequest
    ///     {
    ///         Limit = 1,
    ///         Id = "id",
    ///         Date = new DateOnly(2023, 1, 15),
    ///         Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Bytes = "bytes",
    ///         User = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///         UserList =
    ///         [
    ///             new User
    ///             {
    ///                 Name = "name",
    ///                 Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///             },
    ///         ],
    ///         OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         KeyValue = new Dictionary&lt;string, string&gt;() { { "keyValue", "keyValue" } },
    ///         OptionalString = "optionalString",
    ///         NestedUser = new NestedUser
    ///         {
    ///             Name = "name",
    ///             User = new User
    ///             {
    ///                 Name = "name",
    ///                 Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///             },
    ///         },
    ///         OptionalUser = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///         ExcludeUser =
    ///         [
    ///             new User
    ///             {
    ///                 Name = "name",
    ///                 Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///             },
    ///         ],
    ///         Filter = ["filter"],
    ///         Neighbor = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///         NeighborRequired = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<SearchResponse> SearchAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["limit"] = request.Limit.ToString();
        _query["id"] = request.Id;
        _query["date"] = request.Date.ToString(Constants.DateFormat);
        _query["deadline"] = request.Deadline.ToString(Constants.DateTimeFormat);
        _query["bytes"] = request.Bytes;
        _query["user"] = JsonUtils.Serialize(request.User);
        _query["userList"] = request
            .UserList.Select(_value => JsonUtils.Serialize(_value))
            .ToList();
        _query["excludeUser"] = request
            .ExcludeUser.Select(_value => JsonUtils.Serialize(_value))
            .ToList();
        _query["filter"] = request.Filter;
        _query["neighborRequired"] = JsonUtils.Serialize(request.NeighborRequired);
        if (request.OptionalDeadline != null)
        {
            _query["optionalDeadline"] = request.OptionalDeadline.Value.ToString(
                Constants.DateTimeFormat
            );
        }
        if (request.KeyValue != null)
        {
            _query["keyValue"] = JsonUtils.Serialize(request.KeyValue);
        }
        if (request.OptionalString != null)
        {
            _query["optionalString"] = request.OptionalString;
        }
        if (request.NestedUser != null)
        {
            _query["nestedUser"] = JsonUtils.Serialize(request.NestedUser);
        }
        if (request.OptionalUser != null)
        {
            _query["optionalUser"] = JsonUtils.Serialize(request.OptionalUser);
        }
        if (request.Neighbor != null)
        {
            _query["neighbor"] = JsonUtils.Serialize(request.Neighbor);
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "user/getUsername",
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
                return JsonUtils.Deserialize<SearchResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
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

        public async Task<RawResponse<SearchResponse>> SearchAsync(
            SearchRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            _query["limit"] = request.Limit.ToString();
            _query["id"] = request.Id;
            _query["date"] = request.Date.ToString(Constants.DateFormat);
            _query["deadline"] = request.Deadline.ToString(Constants.DateTimeFormat);
            _query["bytes"] = request.Bytes;
            _query["user"] = JsonUtils.Serialize(request.User);
            _query["userList"] = request
                .UserList.Select(_value => JsonUtils.Serialize(_value))
                .ToList();
            _query["excludeUser"] = request
                .ExcludeUser.Select(_value => JsonUtils.Serialize(_value))
                .ToList();
            _query["filter"] = request.Filter;
            _query["neighborRequired"] = JsonUtils.Serialize(request.NeighborRequired);
            if (request.OptionalDeadline != null)
            {
                _query["optionalDeadline"] = request.OptionalDeadline.Value.ToString(
                    Constants.DateTimeFormat
                );
            }
            if (request.KeyValue != null)
            {
                _query["keyValue"] = JsonUtils.Serialize(request.KeyValue);
            }
            if (request.OptionalString != null)
            {
                _query["optionalString"] = request.OptionalString;
            }
            if (request.NestedUser != null)
            {
                _query["nestedUser"] = JsonUtils.Serialize(request.NestedUser);
            }
            if (request.OptionalUser != null)
            {
                _query["optionalUser"] = JsonUtils.Serialize(request.OptionalUser);
            }
            if (request.Neighbor != null)
            {
                _query["neighbor"] = JsonUtils.Serialize(request.Neighbor);
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Get,
                        Path = "user/getUsername",
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
                    var body = JsonUtils.Deserialize<SearchResponse>(responseBody)!;
                    return new RawResponse<SearchResponse>
                    {
                        StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri!,
                        Headers = ExtractHeaders(response.Raw),
                        Body = body,
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedApiException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedApiApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
