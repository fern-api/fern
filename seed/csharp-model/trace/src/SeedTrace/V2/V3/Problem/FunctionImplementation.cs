using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record FunctionImplementation
{
    [JsonPropertyName("impl")]
    public required string Impl { get; set; }

    [JsonPropertyName("imports")]
    public string? Imports { get; set; }
}
