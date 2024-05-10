using OneOf;
using SeedEnum;

namespace SeedEnum;

public class SendEnumInlinedRequest
{
    public Operand Operand { get; init; }

    public Operand? MaybeOperand { get; init; }

    public OneOf<Color, Operand> OperandOrColor { get; init; }

    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
