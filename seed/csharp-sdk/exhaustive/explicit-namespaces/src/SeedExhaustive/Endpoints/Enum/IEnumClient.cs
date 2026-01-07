using SeedExhaustive;
using SeedExhaustive.Types.Enum;

namespace SeedExhaustive.Endpoints.Enum;

public partial interface IEnumClient
{
    Task<WeatherReport> GetAndReturnEnumAsync(
        WeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
