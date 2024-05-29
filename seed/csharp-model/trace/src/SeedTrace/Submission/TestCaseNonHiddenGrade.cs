using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }

    [JsonPropertyName("actualResult")]
    public VariableValue? ActualResult { get; init; }

    [JsonPropertyName("exception")]
    public ExceptionV2? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
