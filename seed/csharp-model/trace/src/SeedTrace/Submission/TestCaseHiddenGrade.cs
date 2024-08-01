using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestCaseHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }
}
