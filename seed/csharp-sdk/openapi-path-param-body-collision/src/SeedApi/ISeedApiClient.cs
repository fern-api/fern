namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<UpdateProfileIdentifierResponse> UpdateProfileIdentifierAsync(
        IdentifierUpdate request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
