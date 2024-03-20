using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithPrimitive
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integer";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "string";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
