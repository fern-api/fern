using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record TraceResponse
{
    [JsonPropertyName("submissionId")]
    public required Guid SubmissionId { get; init; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; init; }

    [JsonPropertyName("returnValue")]
    public object? ReturnValue { get; init; }

    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; init; }

    [JsonPropertyName("stack")]
    public required StackInformation Stack { get; init; }

    [JsonPropertyName("stdout")]
    public string? Stdout { get; init; }
}
