using System;
using SeedBasicAuthEnvironmentVariables;
using SeedBasicAuthEnvironmentVariables.Core;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables;

public partial class SeedBasicAuthEnvironmentVariablesClient
{
    private RawClient _client;

    public SeedBasicAuthEnvironmentVariablesClient(
        string? username = null,
        string? password = null,
        ClientOptions? clientOptions = null
    )
    {
        username ??= GetFromEnvironmentOrThrow(
            "USERNAME",
            "Please pass in username or set the environment variable USERNAME."
        );
        password ??= GetFromEnvironmentOrThrow(
            "PASSWORD",
            "Please pass in password or set the environment variable PASSWORD."
        );
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        BasicAuth = new BasicAuthClient(_client);
        Errors = new ErrorsClient(_client);
    }

    public BasicAuthClient BasicAuth { get; init; }

    public ErrorsClient Errors { get; init; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
