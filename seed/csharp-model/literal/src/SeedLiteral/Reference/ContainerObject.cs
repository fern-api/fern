using System.Text.Json.Serialization;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public record ContainerObject
{
    [JsonPropertyName("nestedObjects")]
    public IEnumerable<NestedObjectWithLiterals> NestedObjects { get; set; } =
        new List<NestedObjectWithLiterals>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
