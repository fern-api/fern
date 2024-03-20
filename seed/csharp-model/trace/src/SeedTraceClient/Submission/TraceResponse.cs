using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class TraceResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }

    [JsonPropertyName("returnValue")]
    public OneOf<Value, Value, Value, Value, Value, DebugMapValue, Value, BinaryTreeNodeAndTreeValue, SinglyLinkedListNodeAndListValue, DoublyLinkedListNodeAndListValue, UndefinedValue, NullValue, GenericValue>? ReturnValue { get; init; }

    [JsonPropertyName("expressionLocation")]
    public ExpressionLocation? ExpressionLocation { get; init; }

    [JsonPropertyName("stack")]
    public StackInformation Stack { get; init; }

    [JsonPropertyName("stdout")]
    public string? Stdout { get; init; }
}
