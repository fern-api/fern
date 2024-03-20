using SeedTraceClient.V2.V3
using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class CustomFiles
{
    public class _BasicCustomFiles : BasicCustomFiles
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "basic";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "custom";

        [JsonPropertyName("value")]
        public Dictionary<StringEnum<Language>, Files> Value { get; init; }
    }
}
