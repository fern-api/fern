using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.B;

public record TestType
{
    [JsonPropertyName("a")]
    public required A.Aa.A A { get; set; }

    [JsonPropertyName("b")]
    public required A.Aa.B B { get; set; }
}
