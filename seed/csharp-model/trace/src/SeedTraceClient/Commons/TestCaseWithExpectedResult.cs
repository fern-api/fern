using System.Text.Json.Serialization;
using SeedTraceClient;
using OneOf;

namespace SeedTraceClient;

public class TestCaseWithExpectedResult
{
    [JsonPropertyName("testCase")]
    public TestCase TestCase { get; init; }

    [JsonPropertyName("expectedResult")]
    public OneOf<VariableValue._IntegerValue, VariableValue._BooleanValue, VariableValue._DoubleValue, VariableValue._StringValue, VariableValue._CharValue, VariableValue._MapValue, VariableValue._ListValue, VariableValue._BinaryTreeValue, VariableValue._SinglyLinkedListValue, VariableValue._DoublyLinkedListValue, VariableValue._NullValue> ExpectedResult { get; init; }
}
