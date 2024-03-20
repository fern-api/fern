using System.Text.Json.Serialization;
using OneOf;
using SeedTraceClient;

namespace SeedTraceClient;

public class ActualResult
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "value";

        [JsonPropertyName("value")]
        public OneOf<VariableValue._IntegerValue, VariableValue._BooleanValue, VariableValue._DoubleValue, VariableValue._StringValue, VariableValue._CharValue, VariableValue._MapValue, VariableValue._ListValue, VariableValue._BinaryTreeValue, VariableValue._SinglyLinkedListValue, VariableValue._DoublyLinkedListValue, VariableValue._NullValue> Value { get; init; }
    }
    public class _Exception : ExceptionInfo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "exception";
    }
    public class _ExceptionV2
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "exceptionV2";

        [JsonPropertyName("value")]
        public OneOf<ExceptionV2._Generic, ExceptionV2._Timeout> Value { get; init; }
    }
}
