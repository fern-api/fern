using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IEnumClient
{
    Task<WeatherReport> GetAndReturnEnumAsync(
        WeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
