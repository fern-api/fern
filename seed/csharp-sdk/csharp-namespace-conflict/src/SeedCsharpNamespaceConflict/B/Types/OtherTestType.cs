using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.B;

public record OtherTestType
{
    [JsonPropertyName("aProperty")]
    public required SeedCsharpNamespaceConflict.A.A AProperty { get; set; }

    [JsonPropertyName("bProperty")]
    public required SeedCsharpNamespaceConflict.A.B BProperty { get; set; }
}
