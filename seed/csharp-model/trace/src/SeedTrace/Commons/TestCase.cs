using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class TestCase
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("params")]
    public List<VariableValue> Params { get; init; }
}
