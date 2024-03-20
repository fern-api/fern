using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class ActualResult
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "value";

        [JsonPropertyName("value")]
        public OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue> Value { get; init; }
    }
    public class _ExceptionInfo : ExceptionInfo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "exception";
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "exceptionV2";

        [JsonPropertyName("value")]
        public OneOf<ExceptionInfo, Timeout> Value { get; init; }
    }
}
