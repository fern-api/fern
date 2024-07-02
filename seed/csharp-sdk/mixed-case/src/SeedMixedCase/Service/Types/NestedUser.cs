using System.Text.Json.Serialization;
using SeedMixedCase;

#nullable enable

namespace SeedMixedCase;

public class NestedUser
{
    [JsonPropertyName("Name")]
    public string Name { get; init; }

    [JsonPropertyName("NestedUser")]
    public User NestedUser_ { get; init; }
}
