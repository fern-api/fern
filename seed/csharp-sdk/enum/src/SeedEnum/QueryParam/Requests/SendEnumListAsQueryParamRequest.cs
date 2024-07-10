using OneOf;
using SeedEnum;

#nullable enable

namespace SeedEnum;

public record SendEnumListAsQueryParamRequest
{
    public required Operand Operand { get; init; }

    public Operand? MaybeOperand { get; init; }

    public required OneOf<Color, Operand> OperandOrColor { get; init; }

    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
