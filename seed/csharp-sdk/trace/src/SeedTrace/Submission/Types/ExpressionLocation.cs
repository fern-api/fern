using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record ExpressionLocation
{
    [JsonPropertyName("start")]
    public required int Start { get; set; }

    [JsonPropertyName("offset")]
    public required int Offset { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
