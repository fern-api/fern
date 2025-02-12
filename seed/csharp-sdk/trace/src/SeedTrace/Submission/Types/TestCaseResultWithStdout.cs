using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public required TestCaseResult Result { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
