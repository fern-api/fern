using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedNullable.Core;

namespace SeedNullable;

public partial class NullableClient
{
    private RawClient _client;

    internal NullableClient(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.Nullable.GetUsersAsync(
    ///     new GetUsersRequest
    ///     {
    ///         Usernames = ["usernames"],
    ///         Avatar = "avatar",
    ///         Activated = [true],
    ///         Tags = [null],
    ///         Extra = null,
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<IEnumerable<User>> GetUsersAsync(
        GetUsersRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _query = new Dictionary<string, object>();
        _query["usernames"] = request.Usernames;
        _query["activated"] = request
            .Activated.Select(_value => JsonUtils.Serialize(_value))
            .ToList();
        _query["tags"] = request.Tags;
        if (request.Avatar != null)
        {
            _query["avatar"] = request.Avatar;
        }
        if (request.Extra != null)
        {
            _query["extra"] = JsonUtils.Serialize(request.Extra.Value);
        }
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/users",
                    Query = _query,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<User>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableException("Failed to deserialize response", e);
            }
        }

        throw new SeedNullableApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Nullable.CreateUserAsync(
    ///     new CreateUserRequest
    ///     {
    ///         Username = "username",
    ///         Tags = new List&lt;string&gt;() { "tags", "tags" },
    ///         Metadata = new Metadata
    ///         {
    ///             CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    ///             Avatar = "avatar",
    ///             Activated = true,
    ///         },
    ///         Avatar = "avatar",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<User> CreateUserAsync(
        CreateUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "/users",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableException("Failed to deserialize response", e);
            }
        }

        throw new SeedNullableApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }

    /// <example>
    /// <code>
    /// await client.Nullable.DeleteUserAsync(new DeleteUserRequest { Username = "xy" });
    /// </code>
    /// </example>
    public async Task<bool> DeleteUserAsync(
        DeleteUserRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Delete,
                    Path = "/users",
                    Body = request,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<bool>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedNullableException("Failed to deserialize response", e);
            }
        }

        throw new SeedNullableApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
