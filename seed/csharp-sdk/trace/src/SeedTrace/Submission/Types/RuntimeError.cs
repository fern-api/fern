using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record RuntimeError
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }
}
