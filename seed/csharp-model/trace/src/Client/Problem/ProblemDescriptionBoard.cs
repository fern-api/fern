using System.Text.Json.Serialization;
using OneOf;
using Client;

namespace Client;

public class ProblemDescriptionBoard
{
    public class _Html
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "html";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Variable
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "variable";

        [JsonPropertyName("value")]
        public OneOf<VariableValue._IntegerValue, VariableValue._BooleanValue, VariableValue._DoubleValue, VariableValue._StringValue, VariableValue._CharValue, VariableValue._MapValue, VariableValue._ListValue, VariableValue._BinaryTreeValue, VariableValue._SinglyLinkedListValue, VariableValue._DoublyLinkedListValue, VariableValue._NullValue> Value { get; init; }
    }
    public class _TestCaseId
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "testCaseId";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
