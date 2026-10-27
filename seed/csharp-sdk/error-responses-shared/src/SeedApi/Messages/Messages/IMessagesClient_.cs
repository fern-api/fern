using SeedApi;

namespace SeedApi.Messages;

public partial interface IMessagesClient_
{
    WithRawResponseTask<IEnumerable<Message>> ListMessagesAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Message> CreateMessageAsync(
        Message request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask DeleteMessageAsync(
        DeleteMessageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
