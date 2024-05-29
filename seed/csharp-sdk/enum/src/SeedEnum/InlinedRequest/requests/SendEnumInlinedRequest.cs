using System.Text.Json.Serialization;
using SeedEnum.Core;
using SeedEnum;
using OneOf;

#nullable enable

namespace SeedEnum;

public class SendEnumInlinedRequest
{
    [JsonPropertyName("operand")JsonConverter(typeof(StringEnumSerializer;
    <Operand;
    >))]
    public Operand Operand { get; init; }

    [JsonPropertyName("maybeOperand")]
    public Operand? MaybeOperand { get; init; }

    [JsonPropertyName("operandOrColor")]
    public OneOf<Color, Operand> OperandOrColor { get; init; }

    [JsonPropertyName("maybeOperandOrColor")]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
