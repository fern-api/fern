using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IEnumClient
{
    WithRawResponseTask<WeatherReport> GetAndReturnEnumAsync(
        WeatherReport request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
