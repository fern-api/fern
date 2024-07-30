using System.Text.Json.Serialization;

#nullable enable

namespace SeedLiteral;

public record SendResponse
{
    [JsonPropertyName("message")]
    public required string Message { get; }

    [JsonPropertyName("status")]
    public required int Status { get; }

    [JsonPropertyName("success")]
    public required bool Success { get; }
}
