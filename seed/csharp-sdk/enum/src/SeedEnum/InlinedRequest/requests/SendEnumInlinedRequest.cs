using System.Text.Json.Serialization;
using OneOf;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public class SendEnumInlinedRequest
{
    [JsonPropertyName("operand")]
    public Operand Operand { get; init; }

    [JsonPropertyName("maybeOperand")]
    public Operand? MaybeOperand { get; init; }

    [JsonPropertyName("operandOrColor")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<Color, Operand>>))]
    public OneOf<Color, Operand> OperandOrColor { get; init; }

    [JsonPropertyName("maybeOperandOrColor")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<Color, Operand>>))]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
