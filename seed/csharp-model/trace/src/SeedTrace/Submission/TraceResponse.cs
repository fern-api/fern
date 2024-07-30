using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record TraceResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; }

    [JsonPropertyName("returnValue")]
    public object? ReturnValue { get; }

    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; }

    [JsonPropertyName("stack")]
    public required StackInformation Stack { get; }

    [JsonPropertyName("stdout")]
    public string? Stdout { get; }
}
