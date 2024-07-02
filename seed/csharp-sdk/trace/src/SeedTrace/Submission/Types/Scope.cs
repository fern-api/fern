using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class Scope
{
    [JsonPropertyName("variables")]
    public Dictionary<string, object> Variables { get; init; }
}
