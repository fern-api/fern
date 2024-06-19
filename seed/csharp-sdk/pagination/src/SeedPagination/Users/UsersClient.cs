using System.Text.Json;
using SeedPagination;

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
            _query["page"] = request.Page;
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage;
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order;
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
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
            return JsonSerializer.Deserialize<ListUsersPaginationResponse>(responseBody);
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
            _query["page"] = request.Page;
        }
        if (request.PerPage != null)
        {
            _query["per_page"] = request.PerPage;
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order;
        }
        if (request.StartingAfter != null)
        {
            _query["starting_after"] = request.StartingAfter;
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
            return JsonSerializer.Deserialize<ListUsersPaginationResponse>(responseBody);
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
            _query["page"] = request.Page;
        }
        if (request.Limit != null)
        {
            _query["limit"] = request.Limit;
        }
        if (request.Order != null)
        {
            _query["order"] = request.Order;
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
            return JsonSerializer.Deserialize<ListUsersPaginationResponse>(responseBody);
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
            _query["cursor"] = request.Cursor;
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
            return JsonSerializer.Deserialize<ListUsersExtendedResponse>(responseBody);
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
            return JsonSerializer.Deserialize<UsernameCursor>(responseBody);
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
            _query["offset"] = request.Offset;
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
            return JsonSerializer.Deserialize<UsernameContainer>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
