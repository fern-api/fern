using System.Text.Json;
using SeedCsharpNamespaceCollision.Core;

namespace SeedCsharpNamespaceCollision.System;

public partial class SystemClient
{
    private RawClient _client;

    internal SystemClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.System.CreateUserAsync(
    ///     new global::SeedCsharpNamespaceCollision.System.User
    ///     {
    ///         Line1 = "line1",
    ///         Line2 = "line2",
    ///         City = "city",
    ///         State = "state",
    ///         Zip = "zip",
    ///         Country = "USA",
    ///     }
    /// );
    /// </code></example>
    public async Task<User> CreateUserAsync(
        User request,
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
                    Path = "/users",
                    Body = request,
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
                throw new SeedCsharpNamespaceCollisionException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpNamespaceCollisionApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.System.CreateTaskAsync(
    ///     new global::SeedCsharpNamespaceCollision.System.Task
    ///     {
    ///         Name = "name",
    ///         User = new global::SeedCsharpNamespaceCollision.System.User
    ///         {
    ///             Line1 = "line1",
    ///             Line2 = "line2",
    ///             City = "city",
    ///             State = "state",
    ///             Zip = "zip",
    ///             Country = "USA",
    ///         },
    ///     }
    /// );
    /// </code></example>
    public async Task<Task> CreateTaskAsync(
        Task request,
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
                    Path = "/users",
                    Body = request,
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
                return JsonUtils.Deserialize<Task>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedCsharpNamespaceCollisionException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpNamespaceCollisionApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
