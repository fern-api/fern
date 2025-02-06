using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TraceResponseV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("file")]
    public required TracedFile File { get; set; }

    [JsonPropertyName("returnValue")]
    public object? ReturnValue { get; set; }

    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; set; }

    [JsonPropertyName("stack")]
    public required StackInformation Stack { get; set; }

    [JsonPropertyName("stdout")]
    public string? Stdout { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
