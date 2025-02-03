using System.Text.Json.Serialization;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

public record StringResponse
{
    [JsonPropertyName("data")]
    public required string Data { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
