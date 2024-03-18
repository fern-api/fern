using System.Text.Json.Serialization

namespace test.Types

public class ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public string String { get; init; }
}
