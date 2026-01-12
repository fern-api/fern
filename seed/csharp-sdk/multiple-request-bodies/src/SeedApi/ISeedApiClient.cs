using OneOf;

namespace SeedApi;

public partial interface ISeedApiClient
{
    Task<OneOf<DocumentMetadata, DocumentUploadResult>> UploadJsonDocumentAsync(
        UploadDocumentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<OneOf<DocumentMetadata, DocumentUploadResult>> UploadPdfDocumentAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
