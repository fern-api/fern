using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

public record TypeWithOptionalUnion
{
    [JsonPropertyName("myUnion")]
    public OneOf<
        string,
        IEnumerable<string>,
        int,
        IEnumerable<int>,
        IEnumerable<IEnumerable<int>>,
        HashSet<string>
    >? MyUnion { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
