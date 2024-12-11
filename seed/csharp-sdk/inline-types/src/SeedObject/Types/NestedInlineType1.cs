using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record NestedInlineType1
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    [JsonPropertyName("bar")]
    public required string Bar { get; set; }

    [JsonPropertyName("myEnum")]
    public required InlineEnum MyEnum { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
