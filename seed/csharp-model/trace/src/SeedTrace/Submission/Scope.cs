using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record Scope
{
    [JsonPropertyName("variables")]
    public Dictionary<string, object> Variables { get; init; } = new Dictionary<string, object>();
}
