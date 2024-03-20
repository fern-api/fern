using SeedExamplesClient;
using System.Text.Json.Serialization;

namespace SeedExamplesClient;

public class Metadata
{
    public class _Html : _IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "html";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Markdown : _IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "markdown";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    namespace SeedExamplesClient;

    private interface _IBase
    {
        [JsonPropertyName("extra")]
        public Dictionary<string, string> Extra { get; init; }
        [JsonPropertyName("tags")]
        public HashSet<string> Tags { get; init; }
    }
}
