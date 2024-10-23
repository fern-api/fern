using System.Text.Json.Serialization;
using SeedMixedCase.Core;

#nullable enable

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
