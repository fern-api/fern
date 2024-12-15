using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record UndiscriminatedUnion1DiscriminatedUnion1InlineType1
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
    public required UndiscriminatedUnion1DiscriminatedUnion1InlineType1InlineType1 Bar { get; set; }

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
