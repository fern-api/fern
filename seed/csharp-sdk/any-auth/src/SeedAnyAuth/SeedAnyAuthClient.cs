using System;
using SeedAnyAuth.Core;

#nullable enable

namespace SeedAnyAuth;

public partial class SeedAnyAuthClient
{
    private RawClient _client;

    public SeedAnyAuthClient(
        string? token = null,
        string? apiKey = null,
        ClientOptions? clientOptions = null
    )
    {
        token ??= GetFromEnvironmentOrThrow(
            "MY_TOKEN",
            "Please pass in token or set the environment variable MY_TOKEN."
        );
        apiKey ??= GetFromEnvironmentOrThrow(
            "MY_API_KEY",
            "Please pass in apiKey or set the environment variable MY_API_KEY."
        );
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-API-Key", apiKey },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>(),
            clientOptions ?? new ClientOptions()
        );
        Auth = new AuthClient(_client);
        User = new UserClient(_client);
    }

    public AuthClient Auth { get; init; }

    public UserClient User { get; init; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
