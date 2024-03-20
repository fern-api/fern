using System.Text.Json.Serialization;
using SeedTraceClient;
using OneOf;

namespace SeedTraceClient;

public class VariableValue
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
    public class _MapValue : MapValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "mapValue";
    }
    public class _ListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "listValue";

        [JsonPropertyName("value")]
        public List<OneOf<VariableValue._IntegerValue, VariableValue._BooleanValue, VariableValue._DoubleValue, VariableValue._StringValue, VariableValue._CharValue, VariableValue._MapValue, VariableValue._ListValue, VariableValue._BinaryTreeValue, VariableValue._SinglyLinkedListValue, VariableValue._DoublyLinkedListValue, VariableValue._NullValue>> Value { get; init; }
    }
    public class _BinaryTreeValue : BinaryTreeValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "binaryTreeValue";
    }
    public class _SinglyLinkedListValue : SinglyLinkedListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "singlyLinkedListValue";
    }
    public class _DoublyLinkedListValue : DoublyLinkedListValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "doublyLinkedListValue";
    }
    public class _NullValue
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "nullValue";
    }
}
