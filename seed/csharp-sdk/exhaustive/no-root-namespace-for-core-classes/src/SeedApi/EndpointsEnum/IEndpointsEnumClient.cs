using SeedApi.Core;

namespace SeedApi;

public partial interface IEndpointsEnumClient
{
    WithRawResponseTask<TypesWeatherReport> EndpointsEnumGetAndReturnEnumAsync(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
