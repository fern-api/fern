using System.Text.Json;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

public partial class SeedPropertyAccessClient
{
    private readonly RawClient _client;

    public SeedPropertyAccessClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedPropertyAccess" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernproperty-access/0.0.1" },
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

    /// <example><code>
    /// await client.CreateUserAsync(
    ///     new User
    ///     {
    ///         Id = "id",
    ///         Email = "email",
    ///         Password = "password",
    ///         Profile = new UserProfile
    ///         {
    ///             Name = "name",
    ///             Verification = new UserProfileVerification { Verified = "verified" },
    ///             Ssn = "ssn",
    ///         },
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
                throw new SeedPropertyAccessException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedPropertyAccessApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
