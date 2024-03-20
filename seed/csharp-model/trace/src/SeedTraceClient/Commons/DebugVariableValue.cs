using System.Text.Json.Serialization
using SeedTraceClient
using OneOf

namespace SeedTraceClient

public class DebugVariableValue
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integerValue";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "booleanValue";

        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "doubleValue";

        [JsonPropertyName("value")]
        public double Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stringValue";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "charValue";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _DebugMapValue : DebugMapValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "mapValue";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "listValue";

        [JsonPropertyName("value")]
        public List<OneOf<Value, Value, Value, Value, Value, DebugMapValue, Value, BinaryTreeNodeAndTreeValue, SinglyLinkedListNodeAndListValue, DoublyLinkedListNodeAndListValue, UndefinedValue, NullValue, GenericValue>> Value { get; init; }
    }
    public class _BinaryTreeNodeAndTreeValue : BinaryTreeNodeAndTreeValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "binaryTreeNodeValue";
    }
    public class _SinglyLinkedListNodeAndListValue : SinglyLinkedListNodeAndListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "singlyLinkedListNodeValue";
    }
    public class _DoublyLinkedListNodeAndListValue : DoublyLinkedListNodeAndListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "doublyLinkedListNodeValue";
    }
    public class _UndefinedValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "undefinedValue";
    }
    public class _NullValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "nullValue";
    }
    public class _GenericValue : GenericValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "genericValue";
    }
}
