using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class TestCaseGrade
{
    public class _TestCaseHiddenGrade : TestCaseHiddenGrade
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "hidden";
    }
    public class _TestCaseNonHiddenGrade : TestCaseNonHiddenGrade
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "nonHidden";
    }
}
