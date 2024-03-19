using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class VariableTypeAndName
{
    [JsonPropertyName("variableType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> VariableType { get; init; }
    [JsonPropertyName("name")]
    public string Name { get; init; }
}
