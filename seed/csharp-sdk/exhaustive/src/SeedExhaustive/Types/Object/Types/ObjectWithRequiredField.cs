using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public class ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public string String { get; init; }
}
