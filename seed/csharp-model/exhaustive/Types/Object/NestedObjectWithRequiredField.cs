using System.Text.Json.Serialization
using test.Types

namespace test.Types

public class NestedObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public string String { get; init; }
    [JsonPropertyName("NestedObject")]
    public ObjectWithOptionalField NestedObject { get; init; }
}
