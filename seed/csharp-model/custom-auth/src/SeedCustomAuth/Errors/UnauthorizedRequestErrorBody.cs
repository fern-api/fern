using System.Text.Json.Serialization;

#nullable enable

namespace SeedCustomAuth;

public record UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }
}
