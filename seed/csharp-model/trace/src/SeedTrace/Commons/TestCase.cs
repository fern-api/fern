using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCase
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("params")]
    public IEnumerable<object> Params { get; set; } = new List<object>();
}
