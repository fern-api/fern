using System.Text.Json.Serialization;

namespace SeedTrace.V2;

public class FunctionImplementation
{
    [JsonPropertyName("impl")]
    public string Impl { get; init; }

    [JsonPropertyName("imports")]
    public List<string?> Imports { get; init; }
}
