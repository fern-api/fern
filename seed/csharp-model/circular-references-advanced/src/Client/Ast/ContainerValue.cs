using System.Text.Json.Serialization;
using OneOf;
using Client;

namespace Client;

public class ContainerValue
{
    public class _List
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "list";

        [JsonPropertyName("value")]
        public List<OneOf<FieldValue._PrimitiveValue, FieldValue._ObjectValue, FieldValue._ContainerValue>> Value { get; init; }
    }
    public class _Optional
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "optional";

        [JsonPropertyName("value")]
        public OneOf<FieldValue._PrimitiveValue, FieldValue._ObjectValue, FieldValue._ContainerValue>? Value { get; init; }
    }
}
