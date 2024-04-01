using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace.V2;

public class LightweightProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }

    [JsonPropertyName("variableTypes")]
    public HashSet<OneOf<VariableType._IntegerType, VariableType._DoubleType, VariableType._BooleanType, VariableType._StringType, VariableType._CharType, VariableType._ListType, VariableType._MapType, VariableType._BinaryTreeType, VariableType._SinglyLinkedListType, VariableType._DoublyLinkedListType>> VariableTypes { get; init; }
}
