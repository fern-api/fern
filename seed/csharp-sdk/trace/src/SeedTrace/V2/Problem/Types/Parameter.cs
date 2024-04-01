using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace.V2;

public class Parameter
{
    [JsonPropertyName("parameterId")]
    public string ParameterId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("variableType")]
    public OneOf<VariableType._IntegerType, VariableType._DoubleType, VariableType._BooleanType, VariableType._StringType, VariableType._CharType, VariableType._ListType, VariableType._MapType, VariableType._BinaryTreeType, VariableType._SinglyLinkedListType, VariableType._DoublyLinkedListType> VariableType { get; init; }
}
