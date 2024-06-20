using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class TestCase
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("params")]
    public IEnumerable<object> Params { get; init; }
}
