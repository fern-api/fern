using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

public record Name
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("value")]
    public required string Value { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
