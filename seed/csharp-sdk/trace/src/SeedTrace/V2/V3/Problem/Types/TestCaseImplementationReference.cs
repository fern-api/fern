using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class TestCaseImplementationReference
{
    public class _TemplateId
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "templateId";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Implementation : TestCaseImplementation
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "implementation";
    }
}
