using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types.Object;

public record DoubleOptional
{
    [JsonPropertyName("optionalAlias")]
    public string? OptionalAlias { get; set; }
}
