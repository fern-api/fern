using System.Text.Json;
using SeedCsharpNamespaceCollision.Core;
using SeedCsharpNamespaceCollision.System;

namespace SeedCsharpNamespaceCollision;

public partial class SeedCsharpNamespaceCollisionClient
{
    private readonly RawClient _client;

    public SeedCsharpNamespaceCollisionClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpNamespaceCollision" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-namespace-collision/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
        System = new SystemClient(_client);
    }

    public SystemClient System { get; }

    /// <example><code>
    /// await client.CreateUserAsync(
    ///     new global::SeedCsharpNamespaceCollision.User
    ///     {
    ///         Id = "id",
    ///         Name = "name",
    ///         Email = "email",
    ///         Password = "password",
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
    /// await client.CreateTaskAsync(
    ///     new global::SeedCsharpNamespaceCollision.Task
    ///     {
    ///         Id = "id",
    ///         Name = "name",
    ///         Email = "email",
    ///         Password = "password",
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
