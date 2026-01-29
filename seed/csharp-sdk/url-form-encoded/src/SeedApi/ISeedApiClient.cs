namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<PostSubmitResponse> SubmitFormDataAsync(
        PostSubmitRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
