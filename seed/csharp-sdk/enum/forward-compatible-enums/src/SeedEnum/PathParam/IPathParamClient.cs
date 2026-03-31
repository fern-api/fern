using OneOf;

namespace SeedEnum;

public partial interface IPathParamClient
{
    Task SendAsync(
        Operand operand,
        OneOf<Color, Operand> operandOrColor,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
