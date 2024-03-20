using System.Text.Json.Serialization;
using OneOf;
using SeedTraceClient;

namespace SeedTraceClient;

public class DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public OneOf<DebugVariableValue._IntegerValue, DebugVariableValue._BooleanValue, DebugVariableValue._DoubleValue, DebugVariableValue._StringValue, DebugVariableValue._CharValue, DebugVariableValue._MapValue, DebugVariableValue._ListValue, DebugVariableValue._BinaryTreeNodeValue, DebugVariableValue._SinglyLinkedListNodeValue, DebugVariableValue._DoublyLinkedListNodeValue, DebugVariableValue._UndefinedValue, DebugVariableValue._NullValue, DebugVariableValue._GenericValue> Key { get; init; }

    [JsonPropertyName("value")]
    public OneOf<DebugVariableValue._IntegerValue, DebugVariableValue._BooleanValue, DebugVariableValue._DoubleValue, DebugVariableValue._StringValue, DebugVariableValue._CharValue, DebugVariableValue._MapValue, DebugVariableValue._ListValue, DebugVariableValue._BinaryTreeNodeValue, DebugVariableValue._SinglyLinkedListNodeValue, DebugVariableValue._DoublyLinkedListNodeValue, DebugVariableValue._UndefinedValue, DebugVariableValue._NullValue, DebugVariableValue._GenericValue> Value { get; init; }
}
