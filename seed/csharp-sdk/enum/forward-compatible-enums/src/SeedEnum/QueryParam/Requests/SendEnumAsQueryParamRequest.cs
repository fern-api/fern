using OneOf;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public record SendEnumAsQueryParamRequest
{
    public required Operand Operand { get; set; }

    public Operand? MaybeOperand { get; set; }

    public required OneOf<Color, Operand> OperandOrColor { get; set; }

    public OneOf<Color, Operand>? MaybeOperandOrColor { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
