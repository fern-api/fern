using System.Text.Json.Serialization;
using OneOf;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public record SendEnumInlinedRequest
{
    [JsonPropertyName("operand")]
    public required Operand Operand { get; }

    [JsonPropertyName("maybeOperand")]
    public Operand? MaybeOperand { get; }

    [JsonPropertyName("operandOrColor")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<Color, Operand>>))]
    public required OneOf<Color, Operand> OperandOrColor { get; }

    [JsonPropertyName("maybeOperandOrColor")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<Color, Operand>>))]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; }
}
