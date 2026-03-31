// ReSharper disable All
// #pragma warning disable
namespace <%= namespace%>.WebSockets;

/// <summary>
/// Abstract base class for WebSocket request messages.
/// Represents different types of messages that can be sent through a WebSocket connection.
/// </summary>
internal abstract class RequestMessage { }

/// <summary>
/// Represents a text message to be sent through a WebSocket connection.
/// </summary>
internal class RequestTextMessage : RequestMessage
{
    /// <summary>
    /// Gets the text content of the message.
    /// </summary>
    public string Text { get; }

    /// <summary>
    /// Initializes a new instance of the RequestTextMessage class.
    /// </summary>
    /// <param name="text">The text content of the message.</param>
    public RequestTextMessage(string text)
    {
        Text = text;
    }
}

/// <summary>
/// Represents a binary message to be sent through a WebSocket connection.
/// </summary>
internal class RequestBinaryMessage : RequestMessage
{
    /// <summary>
    /// Gets the binary data of the message.
    /// </summary>
    public byte[] Data { get; }

    /// <summary>
    /// Initializes a new instance of the RequestBinaryMessage class.
    /// </summary>
    /// <param name="data">The binary data of the message.</param>
    public RequestBinaryMessage(byte[] data)
    {
        Data = data;
    }
}

/// <summary>
/// Represents a binary message with array segment data to be sent through a WebSocket connection.
/// </summary>
internal class RequestBinarySegmentMessage : RequestMessage
{
    /// <summary>
    /// Gets the binary data segment of the message.
    /// </summary>
    public ArraySegment<byte> Data { get; }

    /// <summary>
    /// Initializes a new instance of the RequestBinarySegmentMessage class.
    /// </summary>
    /// <param name="data">The binary data segment of the message.</param>
    public RequestBinarySegmentMessage(ArraySegment<byte> data)
    {
        Data = data;
    }
}
