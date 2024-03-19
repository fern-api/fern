using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class DebugKeyValuePairs
{
    [JsonPropertyName("key")]
    public OneOf<Value,Value,Value,Value,Value,DebugMapValue,Value,BinaryTreeNodeAndTreeValue,SinglyLinkedListNodeAndListValue,DoublyLinkedListNodeAndListValue,UndefinedValue,NullValue,GenericValue> Key { get; init; }
    [JsonPropertyName("value")]
    public OneOf<Value,Value,Value,Value,Value,DebugMapValue,Value,BinaryTreeNodeAndTreeValue,SinglyLinkedListNodeAndListValue,DoublyLinkedListNodeAndListValue,UndefinedValue,NullValue,GenericValue> Value { get; init; }
}
