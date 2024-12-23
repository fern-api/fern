using System.Text.Json.Serialization;
using OneOf;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record GetUndiscriminatedUnionRequest
{
    [JsonPropertyName("bar")]
    public required OneOf<
        UndiscriminatedUnion1InlineType1,
        UndiscriminatedUnion1InlineType2,
        object,
        object,
        UndiscriminatedUnion1InlineEnum1,
        string,
        IEnumerable<UndiscriminatedUnion1InlineListItem1>,
        HashSet<UndiscriminatedUnion1InlineSetItem1>,
        Dictionary<string, UndiscriminatedUnion1InlineMapItem1>,
        ReferenceType
    > Bar { get; set; }

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
