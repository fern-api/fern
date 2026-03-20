using System.Net.WebSockets;
using System.Text;
using NUnit.Framework;
using <%= namespace%>.Core.WebSockets;

namespace <%= testNamespace%>.Core.WebSockets;

[TestFixture]
public class WebSocketClientTests
{
    [Test]
    public async Task ConnectAsync_EstablishesConnection()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));

        await client.ConnectAsync();

        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Connected));
    }

    [Test]
    public async Task ConnectAsync_RaisesConnectedEvent()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        var connected = new TaskCompletionSource<Connected>();
        client.Connected.Subscribe(c => connected.TrySetResult(c));

        await client.ConnectAsync();

        var result = await Task.WhenAny(connected.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(connected.Task));
    }

    [Test]
    public async Task CloseAsync_ClosesConnection()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Connected));

        await client.CloseAsync();
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));
    }

    [Test]
    public async Task CloseAsync_RaisesClosedEvent()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        var closed = new TaskCompletionSource<Closed>();
        client.Closed.Subscribe(c => closed.TrySetResult(c));

        await client.ConnectAsync();
        await client.CloseAsync();

        var result = await Task.WhenAny(closed.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(closed.Task));
    }

    [Test]
    public async Task SendInstant_Text_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<string>();
        server.OnTextMessage = msg =>
        {
            serverReceived.TrySetResult(msg);
            return null;
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        await client.SendInstant("test-message");

        var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(serverReceived.Task));
        Assert.That(serverReceived.Task.Result, Is.EqualTo("test-message"));
    }

    [Test]
    public async Task SendInstant_Binary_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<byte[]>();
        server.OnBinaryMessage = data =>
        {
            serverReceived.TrySetResult(data);
            return null;
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        await client.SendInstant(new byte[] { 0x01, 0x02, 0x03 });

        var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(serverReceived.Task));
        Assert.That(serverReceived.Task.Result, Is.EqualTo(new byte[] { 0x01, 0x02, 0x03 }));
    }

    [Test]
    public async Task Send_QueuedText_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<string>();
        server.OnTextMessage = msg =>
        {
            serverReceived.TrySetResult(msg);
            return null;
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        var queued = client.Send("queued-text");
        Assert.That(queued, Is.True);

        var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(serverReceived.Task));
        Assert.That(serverReceived.Task.Result, Is.EqualTo("queued-text"));
    }

    [Test]
    public async Task Send_QueuedBinary_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<byte[]>();
        server.OnBinaryMessage = data =>
        {
            serverReceived.TrySetResult(data);
            return null;
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        var queued = client.Send(new byte[] { 0xAB, 0xCD });
        Assert.That(queued, Is.True);

        var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(serverReceived.Task));
        Assert.That(serverReceived.Task.Result, Is.EqualTo(new byte[] { 0xAB, 0xCD }));
    }

    [Test]
    public void SendInstant_WhenDisconnected_Throws()
    {
        var client = new WebSocketClient(new Uri("ws://localhost:1"), _ => Task.CompletedTask);

        Assert.Throws<Exception>(() =>
        {
            client.SendInstant("test").GetAwaiter().GetResult();
        });

        client.Dispose();
    }

    [Test]
    public void Send_WhenDisconnected_Throws()
    {
        var client = new WebSocketClient(new Uri("ws://localhost:1"), _ => Task.CompletedTask);

        Assert.Throws<Exception>(() => client.Send("test"));

        client.Dispose();
    }

    [Test]
    public async Task ConnectAsync_WhenAlreadyConnected_Throws()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();

        Assert.ThrowsAsync<Exception>(async () => await client.ConnectAsync());
    }

    [Test]
    public async Task ConnectAsync_InvalidUri_ThrowsAndSetsDisconnected()
    {
        await using var client = new WebSocketClient(
            new Uri("ws://localhost:1/invalid"),
            _ => Task.CompletedTask
        )
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        try
        {
            await client.ConnectAsync();
            Assert.Fail("Expected connection to fail");
        }
        catch (Exception ex) when (ex is WebSocketException or TaskCanceledException or OperationCanceledException or InvalidOperationException)
        {
            // Expected: connection to invalid URI should fail
        }

        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));
    }

    [Test]
    public async Task PropertyChanged_RaisedOnStatusChange()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        var statusChanges = new List<string>();
        client.PropertyChanged += (_, args) =>
        {
            if (args.PropertyName == nameof(client.Status))
                statusChanges.Add(client.Status.ToString());
        };

        await client.ConnectAsync();
        await client.CloseAsync();

        // Should have: Connecting -> Connected -> Disconnecting -> Disconnected
        Assert.That(statusChanges, Does.Contain("Connecting"));
        Assert.That(statusChanges, Does.Contain("Connected"));
        Assert.That(statusChanges, Does.Contain("Disconnecting"));
        Assert.That(statusChanges, Does.Contain("Disconnected"));
    }

    [Test]
    public async Task TextMessageReceived_InvokesHandler()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = _ => """{"alpha":"hello","beta":42}""";
        server.Start();

        var received = new TaskCompletionSource<string>();
        await using var client = new WebSocketClient(
            server.Uri,
            async stream =>
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                received.TrySetResult(await reader.ReadToEndAsync());
            }
        )
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        await client.SendInstant("trigger");

        var result = await Task.WhenAny(received.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(received.Task));
        Assert.That(received.Task.Result, Does.Contain("alpha"));
    }

    [Test]
    public async Task DisposeAsync_CleansUpResources()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Connected));

        await client.DisposeAsync();
        // After dispose, events should be cleaned up (no way to check directly, but no exception)
    }

    [Test]
    public async Task Dispose_Sync_CleansUpResources()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        await client.ConnectAsync();
        client.Dispose();
        // No exception means success
    }

    [Test]
    public async Task DefaultProperties_HaveExpectedValues()
    {
        var client = new WebSocketClient(new Uri("ws://localhost:1"), _ => Task.CompletedTask);

        Assert.That(client.ConnectTimeout, Is.EqualTo(TimeSpan.FromSeconds(5)));
        Assert.That(client.SendTimeout, Is.EqualTo(TimeSpan.FromSeconds(30)));
        Assert.That(client.IsReconnectionEnabled, Is.False);
        Assert.That(client.ReconnectTimeout, Is.EqualTo(TimeSpan.FromMinutes(1)));
        Assert.That(client.ErrorReconnectTimeout, Is.EqualTo(TimeSpan.FromMinutes(1)));
        Assert.That(client.LostReconnectTimeout, Is.Null);
        Assert.That(client.Backoff, Is.Not.Null);
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));
        Assert.That(client.HttpInvoker, Is.Null);

        client.Dispose();
    }

    [Test]
    public async Task ExceptionOccurred_CanSubscribe()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
        };

        Exception? caught = null;
        client.ExceptionOccurred.Subscribe(ex => caught = ex);

        // No exception should be raised during normal connection
        await client.ConnectAsync();
        await Task.Delay(200);
        await client.CloseAsync();

        // We can't guarantee an exception fires, but the subscribe/unsubscribe should work
    }
}
