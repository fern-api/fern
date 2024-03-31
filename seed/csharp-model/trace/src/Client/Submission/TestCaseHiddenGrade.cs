using System.Text.Json.Serialization;

namespace Client;

public class TestCaseHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
