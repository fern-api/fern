using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record RootType1InlineType1NestedInlineType1
{
    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("bar")]
    public required string Bar { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("myEnum")]
    public required InlineEnum1 MyEnum { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("ref")]
    public required ReferenceType Ref { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
