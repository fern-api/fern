using System.Text.Json.Serialization;
using SeedApi;
using OneOf;

namespace SeedApi;

public class FieldValue
{
    public class _PrimitiveValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "primitive_value";

        [JsonPropertyName("value")]
        public PrimitiveValue Value { get; init; }
    }
    public class _ObjectValue : ObjectValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "object_value";
    }
    public class _ContainerValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "container_value";

        [JsonPropertyName("value")]
        public OneOf<ContainerValue._List, ContainerValue._Optional> Value { get; init; }
    }
}
