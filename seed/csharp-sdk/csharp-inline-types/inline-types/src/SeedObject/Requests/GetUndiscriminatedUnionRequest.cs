using System.Text.Json.Serialization;
using OneOf;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record GetUndiscriminatedUnionRequest
{
    [JsonPropertyName("bar")]
    public required OneOf<
        UndiscriminatedUnion1InlineType1,
        UndiscriminatedUnion1InlineType2,
        UndiscriminatedUnion1DiscriminatedUnion1,
        UndiscriminatedUnion1InlineEnum1,
        string,
        IEnumerable<UndiscriminatedUnion1InlineListItem1>,
        HashSet<UndiscriminatedUnion1InlineSetItem1>,
        Dictionary<string, UndiscriminatedUnion1InlineMapItem1>,
        ReferenceType
    > Bar { get; set; }

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
