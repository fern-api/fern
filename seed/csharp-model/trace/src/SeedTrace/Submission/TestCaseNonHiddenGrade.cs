using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }

    [JsonPropertyName("actualResult")]
    public object? ActualResult { get; init; }

    [JsonPropertyName("exception")]
    public object? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
