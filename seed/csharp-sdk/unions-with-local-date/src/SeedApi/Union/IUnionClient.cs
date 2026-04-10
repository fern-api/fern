using OneOf;

namespace SeedApi;

public partial interface IUnionClient
{
    WithRawResponseTask<OneOf<ShapeZero, ShapeOne>> GetAsync(
        UnionGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
        OneOf<ShapeZero, ShapeOne> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
