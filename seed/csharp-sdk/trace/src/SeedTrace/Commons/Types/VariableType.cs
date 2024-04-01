using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class VariableType
{
    public class _IntegerType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integerType";
    }
    public class _DoubleType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "doubleType";
    }
    public class _BooleanType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "booleanType";
    }
    public class _StringType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stringType";
    }
    public class _CharType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "charType";
    }
    public class _ListType : ListType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "listType";
    }
    public class _MapType : MapType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "mapType";
    }
    public class _BinaryTreeType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "binaryTreeType";
    }
    public class _SinglyLinkedListType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "singlyLinkedListType";
    }
    public class _DoublyLinkedListType
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "doublyLinkedListType";
    }
}
