using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record TestCaseExpects
{
    [JsonPropertyName("expectedStdout")]
    public string? ExpectedStdout { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
