using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record InlineType1
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    [JsonPropertyName("bar")]
    public required NestedInlineType1 Bar { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
