using System.Net.Http;
using System.Text.Json;
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

    public async Task<User> GetUsernameAsync(
        GetUsersRequest request,
        RequestOptions? options = null
    )
    {
        var _query = new Dictionary<string, object>() { };
        _query["limit"] = request.Limit.ToString();
        _query["id"] = request.Id.ToString();
        _query["date"] = request.Date.ToString();
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
                Options = options
            }
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
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
