using System.Text.Json.Serialization;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
