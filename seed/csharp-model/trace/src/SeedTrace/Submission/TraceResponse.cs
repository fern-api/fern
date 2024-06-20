using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class TraceResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }

    [JsonPropertyName("returnValue")]
    public object? ReturnValue { get; init; }

    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; init; }

    [JsonPropertyName("stack")]
    public StackInformation Stack { get; init; }

    [JsonPropertyName("stdout")]
    public string? Stdout { get; init; }
}
