namespace SeedApi;

public partial interface ISeedApiClient
{
    Task<PostSubmitResponse> SubmitFormDataAsync(
        PostSubmitRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
