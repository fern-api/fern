using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class ListType
{
    [JsonPropertyName("valueType")]
    public OneOf<IntegerType,DoubleType,BooleanType,StringType,CharType,ListType,MapType,BinaryTreeType,SinglyLinkedListType,DoublyLinkedListType> ValueType { get; init; }
    /// <summary>
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    /// </summary>
    [JsonPropertyName("isFixedLength")]
    public bool? IsFixedLength { get; init; }
}
