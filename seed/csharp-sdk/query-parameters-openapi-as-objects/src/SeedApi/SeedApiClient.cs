using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient : ISeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        clientOptions ??= new ClientOptions();
        var platformHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernquery-parameters-openapi-as-objects/0.0.1" },
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

    private async Task<WithRawResponse<SearchResponse>> SearchAsyncCore(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedApi.Core.QueryStringBuilder.Builder(capacity: 16)
            .Add("limit", request.Limit)
            .Add("id", request.Id)
            .Add("date", request.Date)
            .Add("deadline", request.Deadline)
            .Add("bytes", request.Bytes)
            .AddDeepObject("user", request.User)
            .AddDeepObject("userList", request.UserList)
            .Add("optionalDeadline", request.OptionalDeadline)
            .Add("keyValue", request.KeyValue)
            .Add("optionalString", request.OptionalString)
            .AddDeepObject("nestedUser", request.NestedUser)
            .AddDeepObject("optionalUser", request.OptionalUser)
            .AddDeepObject("excludeUser", request.ExcludeUser)
            .Add("filter", request.Filter)
            .AddDeepObject("neighbor", request.Neighbor)
            .AddDeepObject("neighborRequired", request.NeighborRequired)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "user/getUsername",
                    QueryString = _queryString,
                    Headers = _headers,
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
                var responseData = JsonUtils.Deserialize<SearchResponse>(responseBody)!;
                return new WithRawResponse<SearchResponse>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
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
    public WithRawResponseTask<SearchResponse> SearchAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<SearchResponse>(
            SearchAsyncCore(request, options, cancellationToken)
        );
    }
}
