using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record UndiscriminatedUnion1InlineMapItem1
{
    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

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
