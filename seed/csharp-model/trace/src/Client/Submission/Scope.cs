using System.Text.Json.Serialization;
using OneOf;
using Client;

namespace Client;

public class Scope
{
    [JsonPropertyName("variables")]
    public Dictionary<string, OneOf<DebugVariableValue._IntegerValue, DebugVariableValue._BooleanValue, DebugVariableValue._DoubleValue, DebugVariableValue._StringValue, DebugVariableValue._CharValue, DebugVariableValue._MapValue, DebugVariableValue._ListValue, DebugVariableValue._BinaryTreeNodeValue, DebugVariableValue._SinglyLinkedListNodeValue, DebugVariableValue._DoublyLinkedListNodeValue, DebugVariableValue._UndefinedValue, DebugVariableValue._NullValue, DebugVariableValue._GenericValue>> Variables { get; init; }
}
