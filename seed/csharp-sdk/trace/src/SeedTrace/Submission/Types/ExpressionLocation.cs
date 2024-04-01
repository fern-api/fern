using System.Text.Json.Serialization;

namespace SeedTrace;

public class ExpressionLocation
{
    [JsonPropertyName("start")]
    public int Start { get; init; }

    [JsonPropertyName("offset")]
    public int Offset { get; init; }
}
