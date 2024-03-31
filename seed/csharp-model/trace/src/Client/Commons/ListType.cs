using System.Text.Json.Serialization;
using OneOf;
using Client;

namespace Client;

public class ListType
{
    [JsonPropertyName("valueType")]
    public OneOf<VariableType._IntegerType, VariableType._DoubleType, VariableType._BooleanType, VariableType._StringType, VariableType._CharType, VariableType._ListType, VariableType._MapType, VariableType._BinaryTreeType, VariableType._SinglyLinkedListType, VariableType._DoublyLinkedListType> ValueType { get; init; }

    /// <summary>
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    /// </summary>
    [JsonPropertyName("isFixedLength")]
    public bool? IsFixedLength { get; init; }
}
