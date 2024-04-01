using System.Text.Json.Serialization;

namespace SeedTrace;

public class TestCaseHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
