using System.Net.Http;
using System.Text.Json;
using System.Threading;
using SeedCsharpAccess.Core;

namespace SeedCsharpAccess;

public partial class SeedCsharpAccessClient
{
    private readonly RawClient _client;

    public SeedCsharpAccessClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpAccess" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-property-access/0.0.1" },
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
    }

    /// <example>
    /// <code>
    /// await client.CreateUserAsync(
    ///     new User
    ///     {
    ///         Id = "id",
    ///         Name = "name",
    ///         Email = "email",
    ///         Password = "password",
    ///     }
    /// );
    /// </code>
    /// </example>
    public async Task<User> CreateUserAsync(
        User request,
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
                throw new SeedCsharpAccessException("Failed to deserialize response", e);
            }
        }

        throw new SeedCsharpAccessApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
