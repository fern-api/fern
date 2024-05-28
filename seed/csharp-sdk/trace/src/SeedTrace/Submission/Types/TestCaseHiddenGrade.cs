using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class TestCaseHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
