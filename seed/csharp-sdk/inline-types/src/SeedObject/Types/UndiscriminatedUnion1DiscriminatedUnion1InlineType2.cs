using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record UndiscriminatedUnion1DiscriminatedUnion1InlineType2
{
    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("baz")]
    public required string Baz { get; set; }

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
