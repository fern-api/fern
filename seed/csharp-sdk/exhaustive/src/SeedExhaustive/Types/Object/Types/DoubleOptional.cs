using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record DoubleOptional
{
    [JsonPropertyName("optionalAlias")]
    public string? OptionalAlias { get; }
}
