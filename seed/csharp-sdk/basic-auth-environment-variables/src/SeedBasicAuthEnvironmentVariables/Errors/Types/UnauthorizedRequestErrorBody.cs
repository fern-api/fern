using System.Text.Json.Serialization;

namespace SeedBasicAuthEnvironmentVariables;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
