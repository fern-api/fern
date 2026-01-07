using SeedExamples.File_.Notification;

namespace SeedExamples.File_;

public partial interface IFileClient
{
    public NotificationClient Notification { get; }
    public ServiceClient Service { get; }
}
