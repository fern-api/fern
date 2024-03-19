using System.Text.Json.Serialization
using SeedTraceClient
using OneOf

namespace SeedTraceClient

public class TraceResponseV2
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }
    [JsonPropertyName("file")]
    public TracedFile File { get; init; }
    [JsonPropertyName("returnValue")]
    public OneOf<Value,Value,Value,Value,Value,DebugMapValue,Value,BinaryTreeNodeAndTreeValue,SinglyLinkedListNodeAndListValue,DoublyLinkedListNodeAndListValue,UndefinedValue,NullValue,GenericValue>? ReturnValue { get; init; }
    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; init; }
    [JsonPropertyName("stack")]
    public StackInformation Stack { get; init; }
    [JsonPropertyName("stdout")]
    public string? Stdout { get; init; }
}
