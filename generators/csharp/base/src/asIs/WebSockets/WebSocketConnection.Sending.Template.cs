// ReSharper disable All
#pragma warning disable
using global::System.Net.WebSockets;
using global::System.Text;
using global::System.Threading.Channels;
using Microsoft.Extensions.Logging;

namespace <%= namespace%>.WebSockets;

internal partial class WebSocketConnection
{
    // Timestamped wrapper for queue messages
    private readonly record struct QueuedMessage<T>(DateTime EnqueuedAt, T Payload);

    private Channel<QueuedMessage<string>>? _textSendQueue;
    private Channel<QueuedMessage<byte[]>>? _binarySendQueue;

    private void InitializeSendQueues()
    {
        if (SendQueueLimit > 0)
        {
            _textSendQueue = Channel.CreateBounded<QueuedMessage<string>>(
                new BoundedChannelOptions(SendQueueLimit)
                {
                    SingleReader = true,
                    SingleWriter = false,
                    FullMode = BoundedChannelFullMode.DropWrite
                });
            _binarySendQueue = Channel.CreateBounded<QueuedMessage<byte[]>>(
                new BoundedChannelOptions(SendQueueLimit)
                {
                    SingleReader = true,
                    SingleWriter = false,
                    FullMode = BoundedChannelFullMode.DropWrite
                });
        }
        else
        {
            _textSendQueue = Channel.CreateUnbounded<QueuedMessage<string>>(
                new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });
            _binarySendQueue = Channel.CreateUnbounded<QueuedMessage<byte[]>>(
                new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });
        }
    }

    /// <summary>
    /// Queues a text message for sending. Actual send happens on a background thread.
    /// </summary>
    /// <returns>true if the message was written to the queue</returns>
    public bool Send(string message)
    {
        return _textSendQueue?.Writer.TryWrite(
            new QueuedMessage<string>(DateTime.UtcNow, message)) ?? false;
    }

    /// <summary>
    /// Queues a binary message for sending. Actual send happens on a background thread.
    /// </summary>
    /// <returns>true if the message was written to the queue</returns>
    public bool Send(byte[] message)
    {
        return _binarySendQueue?.Writer.TryWrite(
            new QueuedMessage<byte[]>(DateTime.UtcNow, message)) ?? false;
    }

    /// <summary>
    /// Send text message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public global::System.Threading.Tasks.Task SendInstant(string message, CancellationToken cancellationToken = default)
    {
        return SendInternalSynchronized(new RequestTextMessage(message), cancellationToken);
    }

    /// <summary>
    /// Send binary message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public global::System.Threading.Tasks.Task SendInstant(Memory<byte> message, CancellationToken cancellationToken = default)
    {
        return SendInternalSynchronized(message, cancellationToken);
    }

    /// <summary>
    /// Send binary message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public global::System.Threading.Tasks.Task SendInstant(ArraySegment<byte> message, CancellationToken cancellationToken = default)
    {
        return SendInternalSynchronized(message, cancellationToken);
    }

    /// <summary>
    /// Send binary message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public global::System.Threading.Tasks.Task SendInstant(byte[] message, CancellationToken cancellationToken = default)
    {
        return SendInternalSynchronized(new ArraySegment<byte>(message), cancellationToken);
    }

    private async global::System.Threading.Tasks.Task SendInternalSynchronized(RequestMessage message, CancellationToken cancellationToken = default)
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message, cancellationToken);
        }
    }

    private async global::System.Threading.Tasks.Task SendInternal(RequestMessage message, CancellationToken cancellationToken = default)
    {
        if (!IsClientConnected())
        {
            return;
        }

        ArraySegment<byte> payload;
        WebSocketMessageType messageType;

        switch (message)
        {
            case RequestTextMessage textMessage:
                payload = new ArraySegment<byte>(Encoding.UTF8.GetBytes(textMessage.Text));
                messageType = WebSocketMessageType.Text;
                break;
            case RequestBinaryMessage binaryMessage:
                payload = new ArraySegment<byte>(binaryMessage.Data);
                messageType = WebSocketMessageType.Binary;
                break;
            case RequestBinarySegmentMessage segmentMessage:
                payload = segmentMessage.Data;
                messageType = WebSocketMessageType.Binary;
                break;
            default:
                throw new ArgumentException($"Unknown message type: {message.GetType()}");
        }

        using var sendCts = cancellationToken != default
            ? CancellationTokenSource.CreateLinkedTokenSource(
                _cancellation?.Token ?? CancellationToken.None, cancellationToken)
            : CancellationTokenSource.CreateLinkedTokenSource(
                _cancellation?.Token ?? CancellationToken.None);
        sendCts.CancelAfter(SendTimeout);

        try
        {
            await _client
                .SendAsync(payload, messageType, true, sendCts.Token)
                .ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (
            sendCts.IsCancellationRequested
            && !cancellationToken.IsCancellationRequested
            && !(_cancellation?.IsCancellationRequested ?? false))
        {
            _logger.LogWarning(
                "SendAsync timed out after {Timeout}ms, aborting connection",
                SendTimeout.TotalMilliseconds);
            _client?.Abort();
            throw new WebsocketException(
                $"SendAsync timed out after {SendTimeout.TotalMilliseconds}ms. "
                + "The remote peer may be unreachable. Connection has been aborted.");
        }
    }

    private async global::System.Threading.Tasks.Task SendInternalSynchronized(ArraySegment<byte> message, CancellationToken cancellationToken = default)
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message, cancellationToken);
        }
    }

    private async global::System.Threading.Tasks.Task SendInternalSynchronized(Memory<byte> message, CancellationToken cancellationToken = default)
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message, cancellationToken);
        }
    }

    private async global::System.Threading.Tasks.Task SendInternal(ArraySegment<byte> payload, CancellationToken cancellationToken = default)
    {
        if (!IsClientConnected())
        {
            return;
        }

        using var sendCts = cancellationToken != default
            ? CancellationTokenSource.CreateLinkedTokenSource(
                _cancellation?.Token ?? CancellationToken.None, cancellationToken)
            : CancellationTokenSource.CreateLinkedTokenSource(
                _cancellation?.Token ?? CancellationToken.None);
        sendCts.CancelAfter(SendTimeout);

        try
        {
            await _client
                .SendAsync(
                    payload,
                    WebSocketMessageType.Binary,
                    true,
                    sendCts.Token
                )
                .ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (
            sendCts.IsCancellationRequested
            && !cancellationToken.IsCancellationRequested
            && !(_cancellation?.IsCancellationRequested ?? false))
        {
            _logger.LogWarning(
                "SendAsync timed out after {Timeout}ms, aborting connection",
                SendTimeout.TotalMilliseconds);
            _client?.Abort();
            throw new WebsocketException(
                $"SendAsync timed out after {SendTimeout.TotalMilliseconds}ms. "
                + "The remote peer may be unreachable. Connection has been aborted.");
        }
    }

    private async global::System.Threading.Tasks.Task SendInternal(ReadOnlyMemory<byte> payload, CancellationToken cancellationToken = default)
    {
        if (!IsClientConnected())
        {
            return;
        }

        using var sendCts = cancellationToken != default
            ? CancellationTokenSource.CreateLinkedTokenSource(
                _cancellation?.Token ?? CancellationToken.None, cancellationToken)
            : CancellationTokenSource.CreateLinkedTokenSource(
                _cancellation?.Token ?? CancellationToken.None);
        sendCts.CancelAfter(SendTimeout);

        try
        {
#if NET6_0_OR_GREATER
            await _client
                .SendAsync(
                    payload,
                    WebSocketMessageType.Binary,
                    true,
                    sendCts.Token
                )
                .ConfigureAwait(false);
#else
            await _client
                .SendAsync(
                    new ArraySegment<byte>(payload.ToArray()),
                    WebSocketMessageType.Binary,
                    true,
                    sendCts.Token
                )
                .ConfigureAwait(false);
#endif
        }
        catch (OperationCanceledException) when (
            sendCts.IsCancellationRequested
            && !cancellationToken.IsCancellationRequested
            && !(_cancellation?.IsCancellationRequested ?? false))
        {
            _logger.LogWarning(
                "SendAsync timed out after {Timeout}ms, aborting connection",
                SendTimeout.TotalMilliseconds);
            _client?.Abort();
            throw new WebsocketException(
                $"SendAsync timed out after {SendTimeout.TotalMilliseconds}ms. "
                + "The remote peer may be unreachable. Connection has been aborted.");
        }
    }

    private async global::System.Threading.Tasks.Task DrainTextQueue(CancellationToken token)
    {
        if (_textSendQueue == null) return;
        try
        {
            while (await _textSendQueue.Reader.WaitToReadAsync(token))
            {
                while (_textSendQueue.Reader.TryRead(out var msg))
                {
                    // Skip expired messages
                    if (SendCacheItemTimeout.HasValue &&
                        msg.EnqueuedAt.Add(SendCacheItemTimeout.Value) < DateTime.UtcNow)
                    {
                        _logger.LogDebug(
                            "Dropping expired text message (enqueued {EnqueuedAt})",
                            msg.EnqueuedAt);
                        continue;
                    }

                    try
                    {
                        await SendInternalSynchronized(new RequestTextMessage(msg.Payload));
                    }
                    catch (OperationCanceledException) { }
                    catch (Exception e)
                    {
                        await OnExceptionOccurred(e).ConfigureAwait(false);
                    }
                }
            }
        }
        catch (OperationCanceledException) { }
    }

    private async global::System.Threading.Tasks.Task DrainBinaryQueue(CancellationToken token)
    {
        if (_binarySendQueue == null) return;
        try
        {
            while (await _binarySendQueue.Reader.WaitToReadAsync(token))
            {
                while (_binarySendQueue.Reader.TryRead(out var msg))
                {
                    // Skip expired messages
                    if (SendCacheItemTimeout.HasValue &&
                        msg.EnqueuedAt.Add(SendCacheItemTimeout.Value) < DateTime.UtcNow)
                    {
                        _logger.LogDebug(
                            "Dropping expired binary message (enqueued {EnqueuedAt})",
                            msg.EnqueuedAt);
                        continue;
                    }

                    try
                    {
                        await SendInternalSynchronized(new ArraySegment<byte>(msg.Payload));
                    }
                    catch (OperationCanceledException) { }
                    catch (Exception e)
                    {
                        await OnExceptionOccurred(e).ConfigureAwait(false);
                    }
                }
            }
        }
        catch (OperationCanceledException) { }
    }
}
