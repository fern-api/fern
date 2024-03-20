using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithTime
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "value";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "date";

        [JsonPropertyName("value")]
        public DateOnly Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "datetime";

        [JsonPropertyName("value")]
        public DateTime Value { get; init; }
    }
}
