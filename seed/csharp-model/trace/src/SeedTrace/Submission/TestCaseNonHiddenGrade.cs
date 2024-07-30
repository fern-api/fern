using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; }

    [JsonPropertyName("actualResult")]
    public object? ActualResult { get; }

    [JsonPropertyName("exception")]
    public object? Exception { get; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; }
}
