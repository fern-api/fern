using NUnit.Framework;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl.Test.Core.WebSockets;

[TestFixture]
public class RequestMessageTests
{
    [Test]
    public void RequestTextMessage_StoresText()
    {
        var msg = new RequestTextMessage("hello world");

        Assert.That(msg.Text, Is.EqualTo("hello world"));
        Assert.That(msg, Is.InstanceOf<RequestMessage>());
    }

    [Test]
    public void RequestTextMessage_EmptyString()
    {
        var msg = new RequestTextMessage("");

        Assert.That(msg.Text, Is.EqualTo(""));
    }

    [Test]
    public void RequestBinaryMessage_StoresData()
    {
        var data = new byte[] { 0x01, 0x02, 0x03 };
        var msg = new RequestBinaryMessage(data);

        Assert.That(msg.Data, Is.EqualTo(data));
        Assert.That(msg, Is.InstanceOf<RequestMessage>());
    }

    [Test]
    public void RequestBinaryMessage_EmptyArray()
    {
        var msg = new RequestBinaryMessage(Array.Empty<byte>());

        Assert.That(msg.Data, Is.Empty);
    }

    [Test]
    public void RequestBinarySegmentMessage_StoresSegment()
    {
        var data = new byte[] { 0x01, 0x02, 0x03, 0x04, 0x05 };
        var segment = new ArraySegment<byte>(data, 1, 3);
        var msg = new RequestBinarySegmentMessage(segment);

        Assert.That(msg.Data.Count, Is.EqualTo(3));
        Assert.That(msg.Data[0], Is.EqualTo(0x02));
        Assert.That(msg.Data[1], Is.EqualTo(0x03));
        Assert.That(msg.Data[2], Is.EqualTo(0x04));
        Assert.That(msg, Is.InstanceOf<RequestMessage>());
    }

    [Test]
    public void AllMessageTypes_DeriveFromRequestMessage()
    {
        RequestMessage text = new RequestTextMessage("hi");
        RequestMessage binary = new RequestBinaryMessage(new byte[] { 1 });
        RequestMessage segment = new RequestBinarySegmentMessage(
            new ArraySegment<byte>(new byte[] { 1 })
        );

        Assert.That(text, Is.InstanceOf<RequestTextMessage>());
        Assert.That(binary, Is.InstanceOf<RequestBinaryMessage>());
        Assert.That(segment, Is.InstanceOf<RequestBinarySegmentMessage>());
    }
}
