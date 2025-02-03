using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestCaseHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
