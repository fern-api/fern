using System.Text.Json.Serialization
using SeedTraceClient.V2.V3
using OneOf
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }
    [JsonPropertyName("actualResultType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> ActualResultType { get; init; }
}
