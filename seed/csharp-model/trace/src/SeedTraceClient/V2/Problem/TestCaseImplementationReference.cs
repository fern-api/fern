using System.Text.Json.Serialization
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class TestCaseImplementationReference
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "templateId";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _TestCaseImplementation : TestCaseImplementation
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "implementation";
    }
}
