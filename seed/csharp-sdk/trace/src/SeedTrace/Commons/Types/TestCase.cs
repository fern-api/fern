using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCase
{
    [JsonPropertyName("id")]
    public required string Id { get; }

    [JsonPropertyName("params")]
    public IEnumerable<object> Params { get; } = new List<object>();
}
