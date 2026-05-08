using SeedApi;

namespace SeedApi.Endpoints;

public partial interface IEnumClient
{
    WithRawResponseTask<TypesWeatherReport> GetAndReturnEnumAsync(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
