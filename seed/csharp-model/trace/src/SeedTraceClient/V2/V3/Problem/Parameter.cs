using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class Parameter
{
    [JsonPropertyName("parameterId")]
    public string ParameterId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("variableType")]
    public OneOf<IntegerType, DoubleType, BooleanType, StringType, CharType, ListType, MapType, BinaryTreeType, SinglyLinkedListType, DoublyLinkedListType> VariableType { get; init; }
}
