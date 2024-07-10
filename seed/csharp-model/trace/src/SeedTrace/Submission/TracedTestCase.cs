using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record TracedTestCase
{
    [JsonPropertyName("result")]
    public required TestCaseResultWithStdout Result { get; init; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; init; }
}
