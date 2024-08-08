using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.A;

public record TestType
{
    [JsonPropertyName("aProperty")]
    public required A AProperty { get; set; }

    [JsonPropertyName("bProperty")]
    public required B BProperty { get; set; }
}
