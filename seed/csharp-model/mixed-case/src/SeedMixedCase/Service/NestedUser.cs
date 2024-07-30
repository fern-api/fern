using System.Text.Json.Serialization;
using SeedMixedCase;

#nullable enable

namespace SeedMixedCase;

public record NestedUser
{
    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("NestedUser")]
    public required User NestedUser_ { get; set; }
}
