using System.Text.Json.Serialization;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

public record NestedUser
{
    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("NestedUser")]
    public required User NestedUser_ { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
