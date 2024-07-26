using System;
using SeedAuthEnvironmentVariables;
using SeedAuthEnvironmentVariables.Core;

#nullable enable

namespace SeedAuthEnvironmentVariables;

public partial class SeedAuthEnvironmentVariablesClient
{
    private RawClient _client;

    public SeedAuthEnvironmentVariablesClient(
        string xAnotherHeader,
        string? apiKey = null,
        ClientOptions? clientOptions = null
    )
    {
        apiKey ??= GetFromEnvironmentOrThrow(
            "FERN_API_KEY",
            "Please pass in apiKey or set the environment variable FERN_API_KEY."
        );
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "X-FERN-API-KEY", apiKey },
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
