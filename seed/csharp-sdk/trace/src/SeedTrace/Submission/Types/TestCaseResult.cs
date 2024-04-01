using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public OneOf<VariableValue._IntegerValue, VariableValue._BooleanValue, VariableValue._DoubleValue, VariableValue._StringValue, VariableValue._CharValue, VariableValue._MapValue, VariableValue._ListValue, VariableValue._BinaryTreeValue, VariableValue._SinglyLinkedListValue, VariableValue._DoublyLinkedListValue, VariableValue._NullValue> ExpectedResult { get; init; }

    [JsonPropertyName("actualResult")]
    public OneOf<ActualResult._Value, ActualResult._Exception, ActualResult._ExceptionV2> ActualResult { get; init; }

    [JsonPropertyName("passed")]
    public bool Passed { get; init; }
}
