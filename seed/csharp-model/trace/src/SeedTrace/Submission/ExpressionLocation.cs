using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record ExpressionLocation
{
    [JsonPropertyName("start")]
    public required int Start { get; init; }

    [JsonPropertyName("offset")]
    public required int Offset { get; init; }
}
