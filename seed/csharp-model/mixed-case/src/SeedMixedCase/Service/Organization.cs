using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

public record Organization
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
