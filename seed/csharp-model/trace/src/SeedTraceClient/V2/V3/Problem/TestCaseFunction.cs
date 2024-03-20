using SeedTraceClient.V2.V3;
using System.Text.Json.Serialization;

namespace SeedTraceClient.V2.V3;

public class TestCaseFunction
{
    public class _WithActualResult : TestCaseWithActualResultImplementation
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "withActualResult";
    }
    public class _Custom : VoidFunctionDefinition
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "custom";
    }
}
