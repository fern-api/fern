using System.Text.Json.Serialization;

namespace SeedExhaustiveClient.Types;

public class ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public string String { get; init; }
}
