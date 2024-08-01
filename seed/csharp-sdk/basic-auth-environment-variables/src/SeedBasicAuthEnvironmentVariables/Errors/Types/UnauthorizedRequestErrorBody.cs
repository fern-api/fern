using System.Text.Json.Serialization;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables;

public record UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }
}
