using SeedTrace;
using System.Text.Json.Serialization;

namespace SeedTrace;

public class TestCaseGrade
{
    public class _Hidden : TestCaseHiddenGrade
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "hidden";
    }
    public class _NonHidden : TestCaseNonHiddenGrade
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "nonHidden";
    }
}
