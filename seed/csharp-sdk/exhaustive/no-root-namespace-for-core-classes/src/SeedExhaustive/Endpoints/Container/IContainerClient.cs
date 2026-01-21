using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public partial interface IContainerClient
{
    WithRawResponseTask<IEnumerable<string>> GetAndReturnListOfPrimitivesAsync(
        IEnumerable<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<IEnumerable<ObjectWithRequiredField>> GetAndReturnListOfObjectsAsync(
        IEnumerable<ObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<HashSet<string>> GetAndReturnSetOfPrimitivesAsync(
        HashSet<string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<HashSet<ObjectWithRequiredField>> GetAndReturnSetOfObjectsAsync(
        HashSet<ObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(
        Dictionary<string, string> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<
        Dictionary<string, ObjectWithRequiredField>
    > GetAndReturnMapOfPrimToObjectAsync(
        Dictionary<string, ObjectWithRequiredField> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ObjectWithRequiredField?> GetAndReturnOptionalAsync(
        ObjectWithRequiredField? request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
