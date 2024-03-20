using System.Text.Json.Serialization
using StringEnum
using SeedApiClient
using OneOf

namespace SeedApiClient

public class FieldValue
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "primitive_value";

        [JsonPropertyName("value")]
        public StringEnum<PrimitiveValue> Value { get; init; }
    }
    public class _ObjectValue : ObjectValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "object_value";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "container_value";

        [JsonPropertyName("value")]
        public OneOf<Value, Value> Value { get; init; }
    }
}
