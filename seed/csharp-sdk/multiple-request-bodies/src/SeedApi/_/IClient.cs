using OneOf;

namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<OneOf<DocumentMetadata, DocumentUploadResult>> UploadJsonDocumentAsync(
        UploadJsonDocumentRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<OneOf<DocumentMetadata, DocumentUploadResult>> UploadPdfDocumentAsync(
        Stream request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
