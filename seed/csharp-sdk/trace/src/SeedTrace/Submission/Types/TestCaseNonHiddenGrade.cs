using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

    [JsonPropertyName("actualResult")]
    public object? ActualResult { get; set; }

    [JsonPropertyName("exception")]
    public object? Exception { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
