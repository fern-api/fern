using SeedApi;

namespace SeedApi.EndpointsEnum;

public partial interface IEndpointsEnumClient
{
    WithRawResponseTask<TypesWeatherReport> EndpointsEnumGetAndReturnEnumAsync(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
