using System.Text.Json.Serialization;

namespace Client.Types;

public class ObjectWithRequiredField
{
    [JsonPropertyName("string")]
    public string String { get; init; }
}
