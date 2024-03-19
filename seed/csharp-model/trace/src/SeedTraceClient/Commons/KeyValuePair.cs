using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class KeyValuePair
{
    [JsonPropertyName("key")]
    public OneOf<Value,Value,Value,Value,Value,MapValue,Value,BinaryTreeValue,SinglyLinkedListValue,DoublyLinkedListValue,NullValue> Key { get; init; }
    [JsonPropertyName("value")]
    public OneOf<Value,Value,Value,Value,Value,MapValue,Value,BinaryTreeValue,SinglyLinkedListValue,DoublyLinkedListValue,NullValue> Value { get; init; }
}
