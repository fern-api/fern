using System.Text.Json;
using SeedQueryParameters;

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
        var _query = new Dictionary<string, object>() { };
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit;
        }
        if (request.Id != null)
        {
            _query["id"] = request.Id;
        }
        if (request.Date != null)
        {
            _query["date"] = request.Date;
        }
        if (request.Deadline != null)
        {
            _query["deadline"] = request.Deadline;
        }
        if (request.Bytes != null)
        {
            _query["bytes"] = request.Bytes;
        }
        if (request.User != null)
        {
            _query["user"] = request.User;
        }
        if (request.KeyValue != null)
        {
            _query["keyValue"] = request.KeyValue;
        }
        if (request.OptionalString != null)
        {
            _query["optionalString"] = request.OptionalString;
        }
        if (request.NestedUser != null)
        {
            _query["nestedUser"] = request.NestedUser;
        }
        if (request.OptionalUser != null)
        {
            _query["optionalUser"] = request.OptionalUser;
        }
        if (request.ExcludeUser != null)
        {
            _query["excludeUser"] = request.ExcludeUser;
        }
        if (request.Filter != null)
        {
            _query["filter"] = request.Filter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Get,
                Path = "",
                Query = _query
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<User>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
