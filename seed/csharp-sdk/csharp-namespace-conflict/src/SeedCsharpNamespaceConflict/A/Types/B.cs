using System.Text.Json.Serialization;

#nullable enable

namespace SeedCsharpNamespaceConflict.A;

public record B
{
    /// <summary>
    /// This reference to A should not use it's fully qualified name because it's in the same package as A.
    /// </summary>
    [JsonPropertyName("id")]
    public required A Id { get; set; }
}
