using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithOptionalTime
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "date";

        [JsonPropertyName("value")]
        public DateOnly? Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "dateimte";

        [JsonPropertyName("value")]
        public DateTime? Value { get; init; }
    }
}
