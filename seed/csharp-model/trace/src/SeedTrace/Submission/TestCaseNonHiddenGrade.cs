using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }

    [JsonPropertyName("actualResult")]
    public List<VariableValue?> ActualResult { get; init; }

    [JsonPropertyName("exception")]
    public List<ExceptionV2?> Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
