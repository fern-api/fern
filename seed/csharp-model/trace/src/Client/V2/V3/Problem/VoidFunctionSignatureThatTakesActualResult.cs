using System.Text.Json.Serialization;
using Client.V2.V3;
using OneOf;
using Client;

namespace Client.V2.V3;

public class VoidFunctionSignatureThatTakesActualResult
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }

    [JsonPropertyName("actualResultType")]
    public OneOf<VariableType._IntegerType, VariableType._DoubleType, VariableType._BooleanType, VariableType._StringType, VariableType._CharType, VariableType._ListType, VariableType._MapType, VariableType._BinaryTreeType, VariableType._SinglyLinkedListType, VariableType._DoublyLinkedListType> ActualResultType { get; init; }
}
