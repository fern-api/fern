using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record GradedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public required string TestCaseId { get; set; }

    [JsonPropertyName("grade")]
    public required object Grade { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
