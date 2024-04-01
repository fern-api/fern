using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public bool Passed { get; init; }

    [JsonPropertyName("actualResult")]
    public OneOf<VariableValue._IntegerValue, VariableValue._BooleanValue, VariableValue._DoubleValue, VariableValue._StringValue, VariableValue._CharValue, VariableValue._MapValue, VariableValue._ListValue, VariableValue._BinaryTreeValue, VariableValue._SinglyLinkedListValue, VariableValue._DoublyLinkedListValue, VariableValue._NullValue>? ActualResult { get; init; }

    [JsonPropertyName("exception")]
    public OneOf<ExceptionV2._Generic, ExceptionV2._Timeout>? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
