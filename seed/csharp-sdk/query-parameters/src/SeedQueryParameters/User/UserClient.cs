using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedQueryParameters.Core;

#nullable enable

namespace SeedQueryParameters;

public partial class UserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
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
    ///             Name = "string",
    ///             Tags = new List&lt;string&gt;() { "string" },
    ///         },
    ///         UserList = new List&lt;User&gt;()
    ///         {
    ///             new User
    ///             {
    ///                 Name = "string",
    ///                 Tags = new List&lt;string&gt;() { "string" },
    ///             },
    ///         },
    ///         OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///         KeyValue = new Dictionary&lt;string, string&gt;() { { "string", "string" } },
    ///         OptionalString = "string",
    ///         NestedUser = new NestedUser
    ///         {
    ///             Name = "string",
    ///             User = new User
    ///             {
    ///                 Name = "string",
    ///                 Tags = new List&lt;string&gt;() { "string" },
    ///             },
    ///         },
    ///         OptionalUser = new User
    ///         {
    ///             Name = "string",
    ///             Tags = new List&lt;string&gt;() { "string" },
    ///         },
    ///         ExcludeUser =
    ///         [
    ///             new User
    ///             {
    ///                 Name = "string",
    ///                 Tags = new List&lt;string&gt;() { "string" },
    ///             },
    ///         ],
    ///         Filter = ["string"],
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<User> GetUsernameAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["limit"] = request.Limit.ToString();
        _query["id"] = request.Id.ToString();
        _query["date"] = request.Date.ToString(Constants.DateFormat);
        _query["deadline"] = request.Deadline.ToString(Constants.DateTimeFormat);
        _query["bytes"] = request.Bytes.ToString();
        _query["user"] = request.User.ToString();
        _query["userList"] = request.UserList.ToString();
        _query["keyValue"] = request.KeyValue.ToString();
        _query["nestedUser"] = request.NestedUser.ToString();
        _query["excludeUser"] = request.ExcludeUser.Select(_value => _value.ToString()).ToList();
        _query["filter"] = request.Filter;
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
            _query["optionalUser"] = request.OptionalUser.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/user",
                Query = _query,
                Options = options,
            },
            cancellationToken
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedQueryParametersException("Failed to deserialize response", e);
            }
        }

        throw new SeedQueryParametersApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
