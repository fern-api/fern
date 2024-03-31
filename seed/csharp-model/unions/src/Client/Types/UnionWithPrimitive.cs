using System.Text.Json.Serialization;

namespace Client;

public class UnionWithPrimitive
{
    public class _Integer
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integer";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _String
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "string";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
