using System.Text.Json.Serialization;
using SeedTraceClient.V2;
using OneOf;
using SeedTraceClient;

namespace SeedTraceClient.V2;

public class NonVoidFunctionSignature
{
    [JsonPropertyName("parameters")]
    public List<Parameter> Parameters { get; init; }

    [JsonPropertyName("returnType")]
    public OneOf<VariableType._IntegerType, VariableType._DoubleType, VariableType._BooleanType, VariableType._StringType, VariableType._CharType, VariableType._ListType, VariableType._MapType, VariableType._BinaryTreeType, VariableType._SinglyLinkedListType, VariableType._DoublyLinkedListType> ReturnType { get; init; }
}
