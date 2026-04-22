using global::System.Net.WebSockets;
using NUnit.Framework;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl.Test.Core.WebSockets;

[TestFixture]
public class DisconnectionInfoTests
{
    [Test]
    public void Create_WithNullClient_SetsNullProperties()
    {
        var info = DisconnectionInfo.Create(DisconnectionType.Error, null!, new Exception("test"));

        Assert.That(info.Type, Is.EqualTo(DisconnectionType.Error));
        Assert.That(info.CloseStatus, Is.Null);
        Assert.That(info.CloseStatusDescription, Is.Null);
        Assert.That(info.SubProtocol, Is.Null);
        Assert.That(info.Exception, Is.Not.Null);
        Assert.That(info.Exception.Message, Is.EqualTo("test"));
    }

    [Test]
    public void Create_WithNullException_SetsNullException()
    {
        var info = DisconnectionInfo.Create(DisconnectionType.ByUser, null!, null!);

        Assert.That(info.Type, Is.EqualTo(DisconnectionType.ByUser));
        Assert.That(info.Exception, Is.Null);
    }

    [Test]
    public void CancelReconnection_DefaultsFalse()
    {
        var info = DisconnectionInfo.Create(DisconnectionType.Lost, null!, null!);

        Assert.That(info.CancelReconnection, Is.False);
    }

    [Test]
    public void CancelReconnection_CanBeSet()
    {
        var info = DisconnectionInfo.Create(DisconnectionType.Lost, null!, null!);
        info.CancelReconnection = true;

        Assert.That(info.CancelReconnection, Is.True);
    }

    [Test]
    public void CancelClosing_DefaultsFalse()
    {
        var info = DisconnectionInfo.Create(DisconnectionType.ByServer, null!, null!);

        Assert.That(info.CancelClosing, Is.False);
    }

    [Test]
    public void CancelClosing_CanBeSet()
    {
        var info = DisconnectionInfo.Create(DisconnectionType.ByServer, null!, null!);
        info.CancelClosing = true;

        Assert.That(info.CancelClosing, Is.True);
    }

    [Test]
    public void Create_AllDisconnectionTypes()
    {
        foreach (DisconnectionType type in Enum.GetValues(typeof(DisconnectionType)))
        {
            var info = DisconnectionInfo.Create(type, null!, null!);
            Assert.That(info.Type, Is.EqualTo(type));
        }
    }

    [Test]
    public void Constructor_SetsAllProperties()
    {
        var info = new DisconnectionInfo(
            DisconnectionType.ByServer,
            WebSocketCloseStatus.NormalClosure,
            "Normal closure",
            "graphql-ws",
            new InvalidOperationException("test error")
        );

        Assert.That(info.Type, Is.EqualTo(DisconnectionType.ByServer));
        Assert.That(info.CloseStatus, Is.EqualTo(WebSocketCloseStatus.NormalClosure));
        Assert.That(info.CloseStatusDescription, Is.EqualTo("Normal closure"));
        Assert.That(info.SubProtocol, Is.EqualTo("graphql-ws"));
        Assert.That(info.Exception, Is.InstanceOf<InvalidOperationException>());
    }
}
