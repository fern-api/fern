using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

public record Foo
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
