using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCase
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("params")]
    public IEnumerable<object> Params { get; init; } = new List<object>();
}
