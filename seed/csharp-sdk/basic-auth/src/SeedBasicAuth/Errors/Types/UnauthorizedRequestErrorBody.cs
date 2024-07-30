using System.Text.Json.Serialization;

#nullable enable

namespace SeedBasicAuth;

public record UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }
}
