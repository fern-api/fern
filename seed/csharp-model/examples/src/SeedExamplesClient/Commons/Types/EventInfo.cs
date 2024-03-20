using SeedExamplesClient.Commons
using System.Text.Json.Serialization

namespace SeedExamplesClient.Commons

public class EventInfo
{
    public class _Metadata : Metadata
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "metadata";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "tag";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
