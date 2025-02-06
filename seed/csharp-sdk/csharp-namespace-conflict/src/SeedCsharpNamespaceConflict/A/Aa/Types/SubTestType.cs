using System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict.Core;

namespace SeedCsharpNamespaceConflict.A.Aa;

public record SubTestType
{
    [JsonPropertyName("a")]
    public required A A { get; set; }

    [JsonPropertyName("b")]
    public required B B { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
