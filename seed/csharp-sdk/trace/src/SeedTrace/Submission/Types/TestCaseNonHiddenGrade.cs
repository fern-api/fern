using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; init; }

    [JsonPropertyName("actualResult")]
    public object? ActualResult { get; init; }

    [JsonPropertyName("exception")]
    public object? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; init; }
}
