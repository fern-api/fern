// ReSharper disable All
#pragma warning disable
using System.Net.WebSockets;
using System.Text;

namespace <%= namespace%>.WebSockets;

internal partial class WebSocketConnection
{
    /// <summary>
    /// Send text message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public Task SendInstant(string message)
    {
        return SendInternalSynchronized(new RequestTextMessage(message));
    }

    /// <summary>
    /// Send binary message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public Task SendInstant(Memory<byte> message)
    {
        return SendInternalSynchronized(message);
    }

    /// <summary>
    /// Send binary message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public Task SendInstant(ArraySegment<byte> message)
    {
        return SendInternalSynchronized(message);
    }

    /// <summary>
    /// Send binary message to the websocket channel.
    /// It doesn't use a sending queue,
    /// beware of issue while sending two messages in the exact same time
    /// on the full .NET Framework platform
    /// </summary>
    /// <param name="message">Message to be sent</param>
    public Task SendInstant(byte[] message)
    {
        return SendInternalSynchronized(new ArraySegment<byte>(message));
    }

    private async Task SendInternalSynchronized(RequestMessage message)
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message);
        }
    }

    private async Task SendInternal(RequestMessage message)
    {
        if (!IsClientConnected())
        {
            return;
        }

        ArraySegment<byte> payload;

        switch (message)
        {
            case RequestTextMessage textMessage:
                payload = new ArraySegment<byte>(Encoding.UTF8.GetBytes(textMessage.Text));
                break;
            case RequestBinaryMessage binaryMessage:
                payload = new ArraySegment<byte>(binaryMessage.Data);
                break;
            case RequestBinarySegmentMessage segmentMessage:
                payload = segmentMessage.Data;
                break;
            default:
                throw new ArgumentException($"Unknown message type: {message.GetType()}");
        }

        await _client
            .SendAsync(
                payload,
                WebSocketMessageType.Text,
                true,
                _cancellation?.Token ?? CancellationToken.None
            )
            .ConfigureAwait(false);
    }

    private async Task SendInternalSynchronized(ArraySegment<byte> message)
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message);
        }
    }

    private async Task SendInternalSynchronized(Memory<byte> message)
    {
        using (await _locker.LockAsync())
        {
            await SendInternal(message);
        }
    }

    private async Task SendInternal(ArraySegment<byte> payload)
    {
        if (!IsClientConnected())
        {
            return;
        }

        await _client
            .SendAsync(
                payload,
                WebSocketMessageType.Binary,
                true,
                _cancellation?.Token ?? CancellationToken.None
            )
            .ConfigureAwait(false);
    }

    private async Task SendInternal(ReadOnlyMemory<byte> payload)
    {
        if (!IsClientConnected())
        {
            return;
        }
#if NET6_0_OR_GREATER
        await _client
            .SendAsync(
                payload,
                WebSocketMessageType.Binary,
                true,
                _cancellation?.Token ?? CancellationToken.None
            )
            .ConfigureAwait(false);
#else
        await SendInternal(new ArraySegment<byte>(payload.ToArray())).ConfigureAwait(false);
#endif
    }
}
