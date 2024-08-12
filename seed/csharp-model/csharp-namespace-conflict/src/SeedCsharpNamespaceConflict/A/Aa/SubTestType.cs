using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.A.Aa;

public record SubTestType
{
    [JsonPropertyName("a")]
    public required A A { get; set; }

    [JsonPropertyName("b")]
    public required B B { get; set; }
}
