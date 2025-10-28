using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedRequestParameters.Core;

namespace SeedRequestParameters;

public partial class UserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
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
        var _query = new Dictionary<string, object>();
        _query["tags"] = JsonUtils.Serialize(request.Tags);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/user/username",
                    Body = request,
                    Query = _query,
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
        var _query = new Dictionary<string, object>();
        _query["tags"] = JsonUtils.Serialize(request.Tags);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/user/username-referenced",
                    Body = request.Body,
                    Query = _query,
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
    public async Task<User> GetUsernameAsync(
        GetUsersRequest request,
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
        _query["userList"] = JsonUtils.Serialize(request.UserList);
        _query["keyValue"] = JsonUtils.Serialize(request.KeyValue);
        _query["nestedUser"] = JsonUtils.Serialize(request.NestedUser);
        _query["excludeUser"] = request
            .ExcludeUser.Select(_value => JsonUtils.Serialize(_value))
            .ToList();
        _query["filter"] = request.Filter;
        _query["longParam"] = request.LongParam.ToString();
        _query["bigIntParam"] = request.BigIntParam;
        if (request.OptionalDeadline != null)
        {
            _query["optionalDeadline"] = request.OptionalDeadline.Value.ToString(
                Constants.DateTimeFormat
            );
        }
        if (request.OptionalString != null)
        {
            _query["optionalString"] = request.OptionalString;
        }
        if (request.OptionalUser != null)
        {
            _query["optionalUser"] = JsonUtils.Serialize(request.OptionalUser);
        }
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/user",
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
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedRequestParametersException("Failed to deserialize response", e);
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
}
