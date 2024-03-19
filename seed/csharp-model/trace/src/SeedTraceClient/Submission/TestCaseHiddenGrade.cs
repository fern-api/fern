using System.Text.Json.Serialization

namespace SeedTraceClient

public class TestCaseHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
