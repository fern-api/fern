using System.Text.Json.Serialization
using OneOf
using SeedApiClient

namespace SeedApiClient

public class ContainerValue
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "list";

        [JsonPropertyName("value")]
        public List<OneOf<Value, ObjectValue, Value>> Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "optional";

        [JsonPropertyName("value")]
        public OneOf<Value, ObjectValue, Value>? Value { get; init; }
    }
}
