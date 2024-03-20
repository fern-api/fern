using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class Test
{
    public class _And
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "and";

        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    public class _Or
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "or";

        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
}
