using SeedExamples.File_.Notification;

namespace SeedExamples.File_;

public partial interface IFileClient
{
    public INotificationClient Notification { get; }
    public IServiceClient Service { get; }
}
