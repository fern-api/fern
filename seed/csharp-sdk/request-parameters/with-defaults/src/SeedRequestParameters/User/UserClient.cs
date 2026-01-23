using System.Text.Json;
using SeedRequestParameters.Core;

namespace SeedRequestParameters;

public partial class UserClient : IUserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> GetUsernameAsyncCore(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedRequestParameters.Core.QueryStringBuilder.Builder(capacity: 16)
            .Add("limit", request.Limit)
            .Add("id", request.Id)
            .Add("date", request.Date)
            .Add("deadline", request.Deadline)
            .Add("bytes", request.Bytes)
            .AddDeepObject("user", request.User)
            .Add("userList", request.UserList)
            .Add("keyValue", request.KeyValue)
            .AddDeepObject("nestedUser", request.NestedUser)
            .AddDeepObject("excludeUser", request.ExcludeUser)
            .Add("filter", request.Filter)
            .Add("longParam", request.LongParam)
            .Add("bigIntParam", request.BigIntParam);
        if (request.OptionalDeadline != null)
        {
            _queryBuilder.Add("optionalDeadline", request.OptionalDeadline);
        }
        if (request.OptionalString != null)
        {
            _queryBuilder.Add("optionalString", request.OptionalString);
        }
        if (request.OptionalUser != null)
        {
            _queryBuilder.AddDeepObject("optionalUser", request.OptionalUser);
        }
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/user",
                    QueryString = _queryString,
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedRequestParametersApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedRequestParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.User.CreateUsernameAsync(
    ///     new CreateUsernameRequest
    ///     {
    ///         Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         Username = "username",
    ///         Password = "password",
    ///         Name = "test",
    ///     }
    /// );
    /// </code></example>
    public async Task CreateUsernameAsync(
        CreateUsernameRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedRequestParameters.Core.QueryStringBuilder.Builder(
            capacity: 1
        ).Add("tags", request.Tags);
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/user/username",
                    Body = request,
                    QueryString = _queryString,
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
            throw new SeedRequestParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.User.CreateUsernameWithReferencedTypeAsync(
    ///     new CreateUsernameReferencedRequest
    ///     {
    ///         Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         Body = new CreateUsernameBody
    ///         {
    ///             Username = "username",
    ///             Password = "password",
    ///             Name = "test",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task CreateUsernameWithReferencedTypeAsync(
        CreateUsernameReferencedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryBuilder = new SeedRequestParameters.Core.QueryStringBuilder.Builder(
            capacity: 1
        ).Add("tags", request.Tags);
        var _queryString = _queryBuilder
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/user/username-referenced",
                    Body = request.Body,
                    QueryString = _queryString,
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
            throw new SeedRequestParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.User.CreateUsernameOptionalAsync(new CreateUsernameBodyOptionalProperties());
    /// </code></example>
    public async Task CreateUsernameOptionalAsync(
        CreateUsernameBodyOptionalProperties? request,
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
                    Path = "/user/username-optional",
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
            throw new SeedRequestParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.User.GetUsernameAsync(
    ///     new GetUsersRequest
    ///     {
    ///         Limit = 1,
    ///         Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         Date = new DateOnly(2023, 1, 15),
    ///         Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         Bytes = "SGVsbG8gd29ybGQh",
    ///         User = new User
    ///         {
    ///             Name = "name",
    ///             Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         },
    ///         UserList = new List&lt;User&gt;()
    ///         {
    ///             new User
    ///             {
    ///                 Name = "name",
    ///                 Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///             },
    ///             new User
    ///             {
    ///                 Name = "name",
    ///                 Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///             },
    ///         },
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
    ///         LongParam = 1000000,
    ///         BigIntParam = "1000000",
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<User> GetUsernameAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            GetUsernameAsyncCore(request, options, cancellationToken)
        );
    }
}
