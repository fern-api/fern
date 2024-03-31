using System.Text.Json.Serialization;
using OneOf;
using Client;

namespace Client;

public class ObjectFieldValue
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("value")]
    public OneOf<FieldValue._PrimitiveValue, FieldValue._ObjectValue, FieldValue._ContainerValue> Value { get; init; }
}
