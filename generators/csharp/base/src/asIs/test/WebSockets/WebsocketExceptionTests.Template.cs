using NUnit.Framework;
using <%= namespace%>.Core.WebSockets;

namespace <%= testNamespace%>.Core.WebSockets;

[TestFixture]
public class WebsocketExceptionTests
{
    [Test]
    public void DefaultConstructor_CreatesException()
    {
        var ex = new WebsocketException();

        Assert.That(ex, Is.InstanceOf<Exception>());
        Assert.That(ex.Message, Is.Not.Null);
        Assert.That(ex.InnerException, Is.Null);
    }

    [Test]
    public void MessageConstructor_SetsMessage()
    {
        var ex = new WebsocketException("connection failed");

        Assert.That(ex.Message, Is.EqualTo("connection failed"));
        Assert.That(ex.InnerException, Is.Null);
    }

    [Test]
    public void MessageAndInnerException_SetsBoth()
    {
        var inner = new InvalidOperationException("inner error");
        var ex = new WebsocketException("outer error", inner);

        Assert.That(ex.Message, Is.EqualTo("outer error"));
        Assert.That(ex.InnerException, Is.SameAs(inner));
        Assert.That(ex.InnerException!.Message, Is.EqualTo("inner error"));
    }

    [Test]
    public void IsException_DerivedFromSystemException()
    {
        var ex = new WebsocketException("test");

        Assert.That(ex, Is.InstanceOf<Exception>());
        Assert.That(ex, Is.InstanceOf<WebsocketException>());
    }

    [Test]
    public void CanBeCaughtAsException()
    {
        try
        {
            throw new WebsocketException("thrown");
        }
        catch (Exception ex)
        {
            Assert.That(ex, Is.InstanceOf<WebsocketException>());
            Assert.That(ex.Message, Is.EqualTo("thrown"));
        }
    }

    [Test]
    public void CanBeCaughtAsWebsocketException()
    {
        try
        {
            throw new WebsocketException("specific", new TimeoutException("timeout"));
        }
        catch (WebsocketException ex)
        {
            Assert.That(ex.Message, Is.EqualTo("specific"));
            Assert.That(ex.InnerException, Is.InstanceOf<TimeoutException>());
        }
    }
}
