using System;
using SeedBearerTokenEnvironmentVariable;
using SeedBearerTokenEnvironmentVariable.Core;

#nullable enable

namespace SeedBearerTokenEnvironmentVariable;

public partial class SeedBearerTokenEnvironmentVariableClient
{
    private RawClient _client;

    public SeedBearerTokenEnvironmentVariableClient(
        string? apiKey = null,
        ClientOptions? clientOptions = null
    )
    {
        apiKey ??= GetFromEnvironmentOrThrow(
            "COURIER_API_KEY",
            "Please pass in apiKey or set the environment variable COURIER_API_KEY."
        );
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {apiKey}" },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Service = new ServiceClient(_client);
    }

    public ServiceClient Service { get; init; }

    private static string GetFromEnvironmentOrThrow(string env, string message)
    {
        return Environment.GetEnvironmentVariable(env) ?? throw new Exception(message);
    }
}
