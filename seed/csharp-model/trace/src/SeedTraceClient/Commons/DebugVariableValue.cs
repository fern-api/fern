using System.Text.Json.Serialization;
using SeedTraceClient;
using OneOf;

namespace SeedTraceClient;

public class DebugVariableValue
{
    public class _IntegerValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integerValue";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _BooleanValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "booleanValue";

        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    public class _DoubleValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "doubleValue";

        [JsonPropertyName("value")]
        public double Value { get; init; }
    }
    public class _StringValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "stringValue";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _CharValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "charValue";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _MapValue : DebugMapValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "mapValue";
    }
    public class _ListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "listValue";

        [JsonPropertyName("value")]
        public List<OneOf<DebugVariableValue._IntegerValue, DebugVariableValue._BooleanValue, DebugVariableValue._DoubleValue, DebugVariableValue._StringValue, DebugVariableValue._CharValue, DebugVariableValue._MapValue, DebugVariableValue._ListValue, DebugVariableValue._BinaryTreeNodeValue, DebugVariableValue._SinglyLinkedListNodeValue, DebugVariableValue._DoublyLinkedListNodeValue, DebugVariableValue._UndefinedValue, DebugVariableValue._NullValue, DebugVariableValue._GenericValue>> Value { get; init; }
    }
    public class _BinaryTreeNodeValue : BinaryTreeNodeAndTreeValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "binaryTreeNodeValue";
    }
    public class _SinglyLinkedListNodeValue : SinglyLinkedListNodeAndListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "singlyLinkedListNodeValue";
    }
    public class _DoublyLinkedListNodeValue : DoublyLinkedListNodeAndListValue
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
