using System.Text.Json.Serialization;

namespace Client;

public class UnionWithTime
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "value";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _Date
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "date";

        [JsonPropertyName("value")]
        public DateOnly Value { get; init; }
    }
    public class _Datetime
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "datetime";

        [JsonPropertyName("value")]
        public DateTime Value { get; init; }
    }
}
