using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.C;

public record ReferencingB
{
    [JsonPropertyName("bProperty")]
    public required B BProperty { get; set; }
}
