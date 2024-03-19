using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class MapType
{
    [JsonPropertyName("keyType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> KeyType { get; init; }
    [JsonPropertyName("valueType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> ValueType { get; init; }
}
