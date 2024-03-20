using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class ProblemDescriptionBoard
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "html";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "variable";

        [JsonPropertyName("value")]
        public OneOf<Value, Value, Value, Value, Value, MapValue, Value, BinaryTreeValue, SinglyLinkedListValue, DoublyLinkedListValue, NullValue> Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "testCaseId";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
