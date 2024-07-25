using System.Net.Http;
using SeedQueryParameters;
using SeedQueryParameters.Core;

#nullable enable

namespace SeedQueryParameters;

public class UserClient
{
    private RawClient _client;

    public UserClient(RawClient client)
    {
        _client = client;
    }

    public async Task<User> GetUsernameAsync(GetUsersRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "limit", request.Limit.ToString() },
            { "id", request.Id.ToString() },
            { "date", request.Date.ToString() },
            { "deadline", request.Deadline.ToString(Constants.DateTimeFormat) },
            { "bytes", request.Bytes.ToString() },
            { "user", request.User.ToString() },
            { "userList", request.UserList.ToString() },
            { "keyValue", request.KeyValue.ToString() },
            { "nestedUser", request.NestedUser.ToString() },
            { "excludeUser", request.ExcludeUser.ToString() },
            { "filter", request.Filter },
        };
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
                BaseURL = _client.Options.BaseURL,
                Method = HttpMethod.Get,
                Path = "/user",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<User>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
