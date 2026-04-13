using OneOf;

namespace SeedApi;

public partial interface IFileNotificationServiceClient
{
    WithRawResponseTask<
        OneOf<ExceptionZero, ExceptionType>
    > FileNotificationServiceGetExceptionAsync(
        FileNotificationServiceGetExceptionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
