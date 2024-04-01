using SeedTrace.V2.V3;
using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;

namespace SeedTrace.V2.V3;

public class CustomFiles
{
    public class _Basic : BasicCustomFiles
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "basic";
    }
    public class _Custom
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "custom";

        [JsonPropertyName("value")]
        public Dictionary<StringEnum<Language>, Files> Value { get; init; }
    }
}
