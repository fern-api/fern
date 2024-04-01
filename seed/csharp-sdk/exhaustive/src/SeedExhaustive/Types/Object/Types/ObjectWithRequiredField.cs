using System.Text.Json.Serialization;

namespace SeedExhaustive.Types;

public class ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public string String { get; init; }
}
