using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public class FunctionImplementation
{
    [JsonPropertyName("impl")]
    public string Impl { get; init; }

    [JsonPropertyName("imports")]
    public string? Imports { get; init; }
}
