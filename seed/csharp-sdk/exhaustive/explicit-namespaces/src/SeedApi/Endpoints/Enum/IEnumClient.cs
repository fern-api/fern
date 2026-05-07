using SeedApi;

namespace SeedApi.Endpoints.Enum;

public partial interface IEnumClient
{
    WithRawResponseTask<TypesWeatherReport> GetAndReturnEnumAsync(
        TypesWeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
