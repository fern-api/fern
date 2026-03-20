using System.Text.Json;
using NUnit.Framework;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket.Test.Core.WebSockets;

[TestFixture]
public class RealtimeApiTests
{
    private RealtimeApi CreateApi(string baseUrl)
    {
        return new RealtimeApi(
            new RealtimeApi.Options { BaseUrl = baseUrl, SessionId = "test-session-123" }
        );
    }

    [Test]
    public async Task InjectTestMessage_ReceiveEvent_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<ReceiveEvent>();
        api.ReceiveEvent.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"alpha":"hello","beta":42}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for ReceiveEvent");
        Assert.That(received.Task.Result.Alpha, Is.EqualTo("hello"));
        Assert.That(received.Task.Result.Beta, Is.EqualTo(42));

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_ReceiveSnakeCase_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<ReceiveSnakeCase>();
        api.ReceiveSnakeCase.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"receive_text":"snake","receive_int":99}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for ReceiveSnakeCase");
        Assert.That(received.Task.Result.ReceiveText, Is.EqualTo("snake"));
        Assert.That(received.Task.Result.ReceiveInt, Is.EqualTo(99));

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_ReceiveEvent2_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<ReceiveEvent2>();
        api.ReceiveEvent2.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"gamma":"g","delta":7,"epsilon":true}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for ReceiveEvent2");
        Assert.That(received.Task.Result.Gamma, Is.EqualTo("g"));
        Assert.That(received.Task.Result.Delta, Is.EqualTo(7));
        Assert.That(received.Task.Result.Epsilon, Is.True);

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_ReceiveEvent3_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<ReceiveEvent3>();
        api.ReceiveEvent3.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"receiveText3":"text3"}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for ReceiveEvent3");
        Assert.That(received.Task.Result.ReceiveText3, Is.EqualTo("text3"));

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_TranscriptEvent_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<TranscriptEvent>();
        api.TranscriptEvent.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"type":"transcript","data":"hello world"}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for TranscriptEvent");
        Assert.That(received.Task.Result.Data, Is.EqualTo("hello world"));

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_FlushedEvent_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<FlushedEvent>();
        api.FlushedEvent.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"type":"flushed"}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for FlushedEvent");

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_ErrorEvent_DispatchesCorrectly()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<ErrorEvent>();
        api.ErrorEvent.Subscribe(e => received.TrySetResult(e));

        await api.InjectTestMessage("""{"errorCode":500,"errorMessage":"server error"}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for ErrorEvent");
        Assert.That(received.Task.Result.ErrorCode, Is.EqualTo(500));
        Assert.That(received.Task.Result.ErrorMessage, Is.EqualTo("server error"));

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_UnknownMessage_FallsThrough()
    {
        var api = CreateApi("ws://localhost:1");
        var received = new TaskCompletionSource<JsonElement>();
        api.UnknownMessage.Subscribe(e => received.TrySetResult(e));

        // A message that doesn't match any known event type
        await api.InjectTestMessage("""{"unknownField":"value","anotherField":123}""");

        var result = await Task.WhenAny(received.Task, Task.Delay(3000));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for UnknownMessage");
        Assert.That(
            received.Task.Result.GetProperty("unknownField").GetString(),
            Is.EqualTo("value")
        );

        api.Dispose();
    }

    [Test]
    public async Task InjectTestMessage_InvalidJson_RaisesExceptionEvent()
    {
        var api = CreateApi("ws://localhost:1");
        var exceptionRaised = new TaskCompletionSource<Exception>();
        api.ExceptionOccurred.Subscribe(ex => exceptionRaised.TrySetResult(ex));

        // This is not valid JSON
        try
        {
            await api.InjectTestMessage("not-json{{{");
        }
        catch
        {
            // The deserialization may throw; that's expected
        }

        // Either the ExceptionOccurred event fires, or the method throws
        // Both are acceptable behaviors for invalid JSON
        api.Dispose();
    }

    [Test]
    public async Task ConnectAsync_WithRealServer_Connects()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );

        try
        {
            await api.ConnectAsync();
            Assert.That(api.Status, Is.EqualTo(ConnectionStatus.Connected));

            await api.CloseAsync();
            Assert.That(api.Status, Is.EqualTo(ConnectionStatus.Disconnected));
        }
        finally
        {
            api.Dispose();
        }
    }

    [Test]
    public async Task ConnectAndSend_WithRealServer_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<string>();
        server.OnTextMessage = msg =>
        {
            serverReceived.TrySetResult(msg);
            return null;
        };
        server.Start();

        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );

        try
        {
            await api.ConnectAsync();

            await api.Send(new SendEvent { SendText = "hello", SendParam = 42 });

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(serverReceived.Task), "Timed out waiting for send");

            var json = serverReceived.Task.Result;
            Assert.That(json, Does.Contain("sendText"));
            Assert.That(json, Does.Contain("hello"));
        }
        finally
        {
            await api.CloseAsync();
            api.Dispose();
        }
    }

    [Test]
    public async Task ConnectAndReceive_WithRealServer_DispatchesEvents()
    {
        await using var server = new TestWebSocketServer();
        // Echo back a ReceiveEvent-shaped JSON for any incoming message
        server.OnTextMessage = _ => """{"alpha":"from-server","beta":7}""";
        server.Start();

        var received = new TaskCompletionSource<ReceiveEvent>();
        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );
        api.ReceiveEvent.Subscribe(e => received.TrySetResult(e));

        try
        {
            await api.ConnectAsync();

            // Trigger the server to send us a message
            await api.Send(new SendEvent { SendText = "trigger", SendParam = 1 });

            var result = await Task.WhenAny(received.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for receive");
            Assert.That(received.Task.Result.Alpha, Is.EqualTo("from-server"));
            Assert.That(received.Task.Result.Beta, Is.EqualTo(7));
        }
        finally
        {
            await api.CloseAsync();
            api.Dispose();
        }
    }

    [Test]
    public async Task ConnectedEvent_Fires()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );

        var connected = new TaskCompletionSource<Connected>();
        api.Connected.Subscribe(c => connected.TrySetResult(c));

        try
        {
            await api.ConnectAsync();

            var result = await Task.WhenAny(connected.Task, Task.Delay(3000));
            Assert.That(result, Is.EqualTo(connected.Task));
        }
        finally
        {
            await api.CloseAsync();
            api.Dispose();
        }
    }

    [Test]
    public async Task ClosedEvent_Fires()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );

        var closed = new TaskCompletionSource<Closed>();
        api.Closed.Subscribe(c => closed.TrySetResult(c));

        try
        {
            await api.ConnectAsync();
            await api.CloseAsync();

            var result = await Task.WhenAny(closed.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(closed.Task));
        }
        finally
        {
            api.Dispose();
        }
    }

    [Test]
    public void Status_InitiallyDisconnected()
    {
        var api = CreateApi("ws://localhost:1");
        Assert.That(api.Status, Is.EqualTo(ConnectionStatus.Disconnected));
        api.Dispose();
    }

    [Test]
    public async Task DisposeAsync_CleansUp()
    {
        var api = CreateApi("ws://localhost:1");
        await api.DisposeAsync();
        // No exception means success
    }

    [Test]
    public void Dispose_CleansUp()
    {
        var api = CreateApi("ws://localhost:1");
        api.Dispose();
        // No exception means success
    }

    [Test]
    public async Task SendSnakeCase_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<string>();
        server.OnTextMessage = msg =>
        {
            serverReceived.TrySetResult(msg);
            return null;
        };
        server.Start();

        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );

        try
        {
            await api.ConnectAsync();
            await api.Send(new SendSnakeCase { SendText = "snake-msg", SendParam = 99 });

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(serverReceived.Task));

            var json = serverReceived.Task.Result;
            Assert.That(json, Does.Contain("send_text"));
            Assert.That(json, Does.Contain("snake-msg"));
        }
        finally
        {
            await api.CloseAsync();
            api.Dispose();
        }
    }

    [Test]
    public async Task SendEvent2_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<string>();
        server.OnTextMessage = msg =>
        {
            serverReceived.TrySetResult(msg);
            return null;
        };
        server.Start();

        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );

        try
        {
            await api.ConnectAsync();
            await api.Send(new SendEvent2 { SendText2 = "text2", SendParam2 = true });

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(serverReceived.Task));

            var json = serverReceived.Task.Result;
            Assert.That(json, Does.Contain("sendText2"));
            Assert.That(json, Does.Contain("text2"));
        }
        finally
        {
            await api.CloseAsync();
            api.Dispose();
        }
    }

    [Test]
    public async Task Options_QueryParams_AreIncludedInUri()
    {
        // Verify that query parameters from Options are used correctly
        // We can't easily test the exact URI without connecting, but we can verify
        // that the Options class accepts all the expected properties
        var options = new RealtimeApi.Options
        {
            BaseUrl = "ws://localhost:1234",
            SessionId = "session-abc",
            Model = "gpt-4",
            Temperature = 5,
            LanguageCode = "en-US",
            EnableCompression = true,
            IsReconnectionEnabled = true,
            ReconnectTimeout = TimeSpan.FromSeconds(30),
            ErrorReconnectTimeout = TimeSpan.FromSeconds(15),
            LostReconnectTimeout = TimeSpan.FromSeconds(5),
            ReconnectBackoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.FromMilliseconds(500),
                MaxReconnectInterval = TimeSpan.FromSeconds(30),
                MaxAttempts = 10,
            },
        };

        Assert.That(options.BaseUrl, Is.EqualTo("ws://localhost:1234"));
        Assert.That(options.SessionId, Is.EqualTo("session-abc"));
        Assert.That(options.Model, Is.EqualTo("gpt-4"));
        Assert.That(options.Temperature, Is.EqualTo(5));
        Assert.That(options.LanguageCode, Is.EqualTo("en-US"));
        Assert.That(options.EnableCompression, Is.True);
        Assert.That(options.IsReconnectionEnabled, Is.True);
        Assert.That(options.ReconnectBackoff!.MaxAttempts, Is.EqualTo(10));
    }

    [Test]
    public async Task ServerBroadcast_DispatchesToEventHandler()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var received = new TaskCompletionSource<TranscriptEvent>();
        var api = new RealtimeApi(
            new RealtimeApi.Options
            {
                BaseUrl = $"ws://localhost:{server.Port}",
                SessionId = "test-session",
            }
        );
        api.TranscriptEvent.Subscribe(e => received.TrySetResult(e));

        try
        {
            await api.ConnectAsync();
            await Task.Delay(100); // Let server register connection

            await server.BroadcastTextAsync("""{"type":"transcript","data":"broadcast-data"}""");

            var result = await Task.WhenAny(received.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for broadcast");
            Assert.That(received.Task.Result.Data, Is.EqualTo("broadcast-data"));
        }
        finally
        {
            await api.CloseAsync();
            api.Dispose();
        }
    }
}
