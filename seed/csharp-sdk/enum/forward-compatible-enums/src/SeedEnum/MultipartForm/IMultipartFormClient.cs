namespace SeedEnum;

public partial interface IMultipartFormClient
{
    WithRawResponseTask MultipartFormAsync(
        MultipartFormRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
