using System.Text.Json.Serialization

namespace SeedExamplesClient.Commons

public class Data
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "string";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "base64";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
