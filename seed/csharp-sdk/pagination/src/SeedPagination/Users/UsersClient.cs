using System.Net.Http;
using System.Text.Json;
using SeedPagination;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public class UsersClient
{
    private RawClient _client;

    public UsersClient(RawClient client)
    {
        _client = client;
    }

    public async Task<ListUsersPaginationResponse> ListWithCursorPaginationAsync(
        ListUsersCursorPaginationRequest request
    )
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = JsonSerializer.Serialize(request.Order.Value);
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ListUsersPaginationResponse> ListWithBodyCursorPaginationAsync(
        ListUsersBodyCursorPaginationRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/users",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ListUsersPaginationResponse> ListWithOffsetPaginationAsync(
        ListUsersOffsetPaginationRequest request
    )
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = JsonSerializer.Serialize(request.Order.Value);
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ListUsersPaginationResponse> ListWithBodyOffsetPaginationAsync(
        ListUsersBodyOffsetPaginationRequest request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/users",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ListUsersPaginationResponse> ListWithOffsetStepPaginationAsync(
        ListUsersOffsetStepPaginationRequest request
    )
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Page != null)
        {
            _query["page"] = request.Page.ToString();
        }
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit.ToString();
        }
        if (request.Order != null)
        {
            _query["order"] = JsonSerializer.Serialize(request.Order.Value);
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ListUsersPaginationResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ListUsersExtendedResponse> ListWithExtendedResultsAsync(
        ListUsersExtendedRequest request
    )
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Cursor != null)
        {
            _query["cursor"] = request.Cursor.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ListUsersExtendedResponse>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<UsernameCursor> ListUsernamesAsync(ListUsernamesRequest request)
    {
        var _query = new Dictionary<string, object>() { };
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<UsernameCursor>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<UsernameContainer> ListWithGlobalConfigAsync(
        ListWithGlobalConfigRequest request
    )
    {
        var _query = new Dictionary<string, object>() { };
        if (request.Offset != null)
        {
            _query["offset"] = request.Offset.ToString();
        }
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "/users",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<UsernameContainer>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
