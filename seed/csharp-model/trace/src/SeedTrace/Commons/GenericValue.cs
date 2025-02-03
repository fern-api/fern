using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GenericValue
{
    [JsonPropertyName("stringifiedType")]
    public string? StringifiedType { get; set; }

    [JsonPropertyName("stringifiedValue")]
    public required string StringifiedValue { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
