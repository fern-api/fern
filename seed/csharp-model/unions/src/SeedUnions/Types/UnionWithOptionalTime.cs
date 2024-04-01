using System.Text.Json.Serialization;

namespace SeedUnions;

public class UnionWithOptionalTime
{
    public class _Date
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "date";

        [JsonPropertyName("value")]
        public DateOnly? Value { get; init; }
    }
    public class _Dateimte
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "dateimte";

        [JsonPropertyName("value")]
        public DateTime? Value { get; init; }
    }
}
