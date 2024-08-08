using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.C;

public record B
{
    [JsonPropertyName("someProperty")]
    public required string SomeProperty { get; set; }
}
