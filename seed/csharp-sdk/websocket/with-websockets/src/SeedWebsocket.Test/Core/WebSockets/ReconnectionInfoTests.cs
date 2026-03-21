using NUnit.Framework;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket.Test.Core.WebSockets;

[TestFixture]
public class ReconnectionInfoTests
{
    [Test]
    public void Constructor_SetsType()
    {
        var info = new ReconnectionInfo(ReconnectionType.Lost);

        Assert.That(info.Type, Is.EqualTo(ReconnectionType.Lost));
    }

    [Test]
    public void Create_ReturnsNewInstance()
    {
        var info = ReconnectionInfo.Create(ReconnectionType.ByUser);

        Assert.That(info, Is.Not.Null);
        Assert.That(info.Type, Is.EqualTo(ReconnectionType.ByUser));
    }

    [Test]
    public void Create_AllReconnectionTypes()
    {
        foreach (ReconnectionType type in Enum.GetValues(typeof(ReconnectionType)))
        {
            var info = ReconnectionInfo.Create(type);
            Assert.That(info.Type, Is.EqualTo(type));
        }
    }

    [Test]
    public void Constructor_Initial()
    {
        var info = new ReconnectionInfo(ReconnectionType.Initial);
        Assert.That(info.Type, Is.EqualTo(ReconnectionType.Initial));
    }

    [Test]
    public void Constructor_Error()
    {
        var info = new ReconnectionInfo(ReconnectionType.Error);
        Assert.That(info.Type, Is.EqualTo(ReconnectionType.Error));
    }

    [Test]
    public void Constructor_NoMessageReceived()
    {
        var info = new ReconnectionInfo(ReconnectionType.NoMessageReceived);
        Assert.That(info.Type, Is.EqualTo(ReconnectionType.NoMessageReceived));
    }

    [Test]
    public void Constructor_ByServer()
    {
        var info = new ReconnectionInfo(ReconnectionType.ByServer);
        Assert.That(info.Type, Is.EqualTo(ReconnectionType.ByServer));
    }

    [Test]
    public void Create_EquivalentToConstructor()
    {
        var fromCreate = ReconnectionInfo.Create(ReconnectionType.Lost);
        var fromCtor = new ReconnectionInfo(ReconnectionType.Lost);

        Assert.That(fromCreate.Type, Is.EqualTo(fromCtor.Type));
    }
}
