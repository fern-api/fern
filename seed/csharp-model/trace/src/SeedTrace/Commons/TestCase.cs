using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestCase
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("params")]
    public List<VariableValue> Params { get; init; }
}
