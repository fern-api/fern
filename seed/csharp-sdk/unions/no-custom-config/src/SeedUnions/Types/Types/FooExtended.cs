using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

public record FooExtended
{
    [JsonPropertyName("age")]
    public required int Age { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
