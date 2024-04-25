using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TraceResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }

    [JsonPropertyName("returnValue")]
    public List<DebugVariableValue?> ReturnValue { get; init; }

    [JsonPropertyName("expressionLocation")]
    public List<ExpressionLocation?> ExpressionLocation { get; init; }

    [JsonPropertyName("stack")]
    public StackInformation Stack { get; init; }

    [JsonPropertyName("stdout")]
    public List<string?> Stdout { get; init; }
}
