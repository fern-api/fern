using System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.B;

public record TestType
{
    [JsonPropertyName("a")]
    public required A.Aa.A A { get; set; }

    [JsonPropertyName("b")]
    public required A.Aa.B B { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
