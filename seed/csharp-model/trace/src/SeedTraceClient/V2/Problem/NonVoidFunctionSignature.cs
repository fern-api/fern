using System.Text.Json.Serialization
using SeedTraceClient.V2
using OneOf
using SeedTraceClient

namespace SeedTraceClient.V2

public class NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }
    [JsonPropertyName("returnType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> ReturnType { get; init; }
}
