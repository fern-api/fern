using System.Text.Json.Serialization;
using OneOf;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record GetUndiscriminatedUnionRequest
{
    [JsonPropertyName("bar")]
    public required OneOf<
        Types.UndiscriminatedUnion1InlineType1,
        Types.UndiscriminatedUnion1InlineType2,
        Types.UndiscriminatedUnion1DiscriminatedUnion1,
        Types.UndiscriminatedUnion1InlineEnum1,
        string,
        IEnumerable<Types.UndiscriminatedUnion1InlineListItem1>,
        HashSet<Types.UndiscriminatedUnion1InlineSetItem1>,
        Dictionary<string, Types.UndiscriminatedUnion1InlineMapItem1>,
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
