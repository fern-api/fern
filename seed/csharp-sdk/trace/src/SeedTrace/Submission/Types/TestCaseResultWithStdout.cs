using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record TestCaseResultWithStdout
{
    [JsonPropertyName("result")]
    public required TestCaseResult Result { get; init; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; init; }
}
