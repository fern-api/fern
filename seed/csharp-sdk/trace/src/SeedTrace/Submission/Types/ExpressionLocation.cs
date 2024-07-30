using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record ExpressionLocation
{
    [JsonPropertyName("start")]
    public required int Start { get; set; }

    [JsonPropertyName("offset")]
    public required int Offset { get; set; }
}
