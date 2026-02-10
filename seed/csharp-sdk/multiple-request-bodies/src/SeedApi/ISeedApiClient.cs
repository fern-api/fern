using OneOf;

namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<OneOf<DocumentMetadata, DocumentUploadResult>> UploadJsonDocumentAsync(
        UploadDocumentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<OneOf<DocumentMetadata, DocumentUploadResult>> UploadPdfDocumentAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
