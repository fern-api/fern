using System.Text.Json.Serialization;

namespace SeedExamples.Commons;

public class Data
{
    public class _String
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "string";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Base64
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "base64";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
