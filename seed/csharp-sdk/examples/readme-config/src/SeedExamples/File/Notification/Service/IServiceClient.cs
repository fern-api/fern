using SeedExamples;

namespace SeedExamples.File_.Notification;

public partial interface IServiceClient
{
    WithRawResponseTask<SeedExamples.Exception> GetExceptionAsync(
        string notificationId,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
