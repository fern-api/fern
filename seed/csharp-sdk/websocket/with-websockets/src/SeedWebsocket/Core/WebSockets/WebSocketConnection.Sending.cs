// ReSharper disable All
#pragma warning disable
using global::System.Net.WebSockets;
using global::System.Text;
using global::System.Threading.Channels;

namespace SeedWebsocket.Core.WebSockets;

internal partial class WebSocketConnection
{
    private readonly Channel<string> _textSendQueue = Channel.CreateUnbounded<string>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }
    );

    private readonly Channel<byte[]> _binarySendQueue = Channel.CreateUnbounded<byte[]>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }
    );

    /// <summary>
    /// Queues a text message for sending. Actual send happens on a background thread.
    /// </summary>
    /// <returns>true if the message was written to the queue</returns>
    public bool Send(string message)
    {
        return _textSendQueue.Writer.TryWrite(message);
    }

    /// <summary>
    /// Queues a binary message for sending. Actual send happens on a background thread.
    /// </summary>
    /// <returns>true if the message was written to the queue</returns>
    public bool Send(byte[] message)
    {
        return _binarySendQueue.Writer.TryWrite(message);
    }

    /// <summary>
    /// Send text message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public global::System.Threading.Tasks.Task SendInstant(
        string message,
        CancellationToken cancellationToken = default
    )
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
    public global::System.Threading.Tasks.Task SendInstant(
        Memory<byte> message,
        CancellationToken cancellationToken = default
    )
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
    public global::System.Threading.Tasks.Task SendInstant(
        ArraySegment<byte> message,
        CancellationToken cancellationToken = default
    )
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
    public global::System.Threading.Tasks.Task SendInstant(
        byte[] message,
        CancellationToken cancellationToken = default
    )
    {
        return SendInternalSynchronized(new ArraySegment<byte>(message), cancellationToken);
    }

    private async global::System.Threading.Tasks.Task SendInternalSynchronized(
        RequestMessage message,
        CancellationToken cancellationToken = default
    )
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message, cancellationToken);
        }
    }

    private async global::System.Threading.Tasks.Task SendInternal(
        RequestMessage message,
        CancellationToken cancellationToken = default
    )
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

        using var linkedCts = CreateLinkedToken(cancellationToken);
        await _client
            .SendAsync(
                payload,
                messageType,
                true,
                linkedCts?.Token ?? (_cancellation?.Token ?? CancellationToken.None)
            )
            .ConfigureAwait(false);
    }

    private async global::System.Threading.Tasks.Task SendInternalSynchronized(
        ArraySegment<byte> message,
        CancellationToken cancellationToken = default
    )
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message, cancellationToken);
        }
    }

    private async global::System.Threading.Tasks.Task SendInternalSynchronized(
        Memory<byte> message,
        CancellationToken cancellationToken = default
    )
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message, cancellationToken);
        }
    }

    private async global::System.Threading.Tasks.Task SendInternal(
        ArraySegment<byte> payload,
        CancellationToken cancellationToken = default
    )
    {
        if (!IsClientConnected())
        {
            return;
        }

        using var linkedCts = CreateLinkedToken(cancellationToken);
        await _client
            .SendAsync(
                payload,
                WebSocketMessageType.Binary,
                true,
                linkedCts?.Token ?? (_cancellation?.Token ?? CancellationToken.None)
            )
            .ConfigureAwait(false);
    }

    private async global::System.Threading.Tasks.Task SendInternal(
        ReadOnlyMemory<byte> payload,
        CancellationToken cancellationToken = default
    )
    {
        if (!IsClientConnected())
        {
            return;
        }

        using var linkedCts = CreateLinkedToken(cancellationToken);
        var token = linkedCts?.Token ?? (_cancellation?.Token ?? CancellationToken.None);
#if NET6_0_OR_GREATER
        await _client
            .SendAsync(payload, WebSocketMessageType.Binary, true, token)
            .ConfigureAwait(false);
#else
        await SendInternal(new ArraySegment<byte>(payload.ToArray()), cancellationToken)
            .ConfigureAwait(false);
#endif
    }

    private CancellationTokenSource? CreateLinkedToken(CancellationToken cancellationToken)
    {
        if (cancellationToken == default)
        {
            return null;
        }

        var internalToken = _cancellation?.Token ?? CancellationToken.None;
        return internalToken != CancellationToken.None
            ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, internalToken)
            : CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    }

    private async global::System.Threading.Tasks.Task DrainTextQueue(CancellationToken token)
    {
        try
        {
            while (await _textSendQueue.Reader.WaitToReadAsync(token))
            {
                while (_textSendQueue.Reader.TryRead(out var message))
                {
                    try
                    {
                        await SendInternalSynchronized(new RequestTextMessage(message));
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
        try
        {
            while (await _binarySendQueue.Reader.WaitToReadAsync(token))
            {
                while (_binarySendQueue.Reader.TryRead(out var message))
                {
                    try
                    {
                        await SendInternalSynchronized(new ArraySegment<byte>(message));
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
