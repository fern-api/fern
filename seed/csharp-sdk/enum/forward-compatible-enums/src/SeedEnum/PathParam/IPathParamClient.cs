using OneOf;

namespace SeedEnum;

public partial interface IPathParamClient
{
    WithRawResponseTask SendAsync(
        Operand operand,
        OneOf<Color, Operand> operandOrColor,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
