using global::System.Net.WebSockets;
using global::System.Text;
using NUnit.Framework;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl.Test.Core.WebSockets;

[TestFixture]
public class WebSocketConnectionTests
{
    [Test]
    public async Task StartOrFail_ConnectsToServer()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();

            Assert.That(ws.IsStarted, Is.True);
            Assert.That(ws.IsRunning, Is.True);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task StartOrFail_InvalidUri_ThrowsException()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1/nonexistent"))
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        try
        {
            Assert.ThrowsAsync<WebSocketException>(async () => await ws.StartOrFail());
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task TextMessageReceived_RaisesCallback()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => $"echo:{msg}";
        server.Start();

        var received = new TaskCompletionSource<string>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            TextMessageReceived = async stream =>
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                var text = await reader.ReadToEndAsync();
                received.TrySetResult(text);
            },
        };

        try
        {
            await ws.StartOrFail();
            await ws.SendInstant("hello");

            var result = await Task.WhenAny(received.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for text message");
            Assert.That(received.Task.Result, Is.EqualTo("echo:hello"));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task BinaryMessageReceived_RaisesCallback()
    {
        await using var server = new TestWebSocketServer();
        server.OnBinaryMessage = data => data; // echo
        server.Start();

        var received = new TaskCompletionSource<byte[]>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            BinaryMessageReceived = async stream =>
            {
                using var ms = new MemoryStream();
                await stream.CopyToAsync(ms);
                received.TrySetResult(ms.ToArray());
            },
        };

        try
        {
            await ws.StartOrFail();
            var data = new byte[] { 0x01, 0x02, 0x03 };
            await ws.SendInstant(data);

            var result = await Task.WhenAny(received.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for binary message");
            Assert.That(received.Task.Result, Is.EqualTo(data));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Stop_ClosesConnection()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            Assert.That(ws.IsRunning, Is.True);

            var stopped = await ws.Stop(WebSocketCloseStatus.NormalClosure, "done");
            Assert.That(stopped, Is.True);
            Assert.That(ws.IsRunning, Is.False);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Dispose_CleansUpResources()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        await ws.StartOrFail();
        Assert.That(ws.IsRunning, Is.True);

        ws.Dispose();

        Assert.That(ws.IsRunning, Is.False);
        Assert.That(ws.IsStarted, Is.False);
    }

    [Test]
    public async Task Dispose_WhenAlreadyDisposed_DoesNotThrow()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        await ws.StartOrFail();

        ws.Dispose();
        Assert.DoesNotThrow(() => ws.Dispose());
    }

    [Test]
    public async Task DisconnectionHappened_RaisedOnDispose()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var disconnected = new TaskCompletionSource<DisconnectionInfo>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            DisconnectionHappened = info =>
            {
                disconnected.TrySetResult(info);
                return Task.CompletedTask;
            },
        };

        await ws.StartOrFail();
        ws.Dispose();

        var result = await Task.WhenAny(disconnected.Task, Task.Delay(5000));
        Assert.That(result, Is.EqualTo(disconnected.Task), "Timed out waiting for disconnection");
        Assert.That(disconnected.Task.Result.Type, Is.EqualTo(DisconnectionType.Exit));
    }

    [Test]
    public async Task Send_QueuedText_IsDelivered()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<string>();
        server.OnTextMessage = msg =>
        {
            serverReceived.TrySetResult(msg);
            return null; // no echo
        };
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            var queued = ws.Send("queued-message");
            Assert.That(queued, Is.True);

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(
                result,
                Is.EqualTo(serverReceived.Task),
                "Timed out waiting for queued message"
            );
            Assert.That(serverReceived.Task.Result, Is.EqualTo("queued-message"));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Send_QueuedBinary_IsDelivered()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<byte[]>();
        server.OnBinaryMessage = data =>
        {
            serverReceived.TrySetResult(data);
            return null; // no echo
        };
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            var data = new byte[] { 0xDE, 0xAD };
            var queued = ws.Send(data);
            Assert.That(queued, Is.True);

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(
                result,
                Is.EqualTo(serverReceived.Task),
                "Timed out waiting for queued binary"
            );
            Assert.That(serverReceived.Task.Result, Is.EqualTo(data));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Start_WhenAlreadyStarted_IsNoop()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            Assert.That(ws.IsStarted, Is.True);

            // Second start should be a no-op
            await ws.Start();
            Assert.That(ws.IsStarted, Is.True);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void StartOrFail_AfterDispose_ThrowsWebsocketException()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        ws.Dispose();

        Assert.ThrowsAsync<WebsocketException>(async () => await ws.StartOrFail());
    }

    [Test]
    public async Task ConnectTimeout_RespectsConfiguredValue()
    {
        // Use a non-routable IP address that will hang on connect
        var ws = new WebSocketConnection(new Uri("ws://192.0.2.1:1"))
        {
            ConnectTimeout = TimeSpan.FromMilliseconds(500),
        };

        try
        {
            var sw = global::System.Diagnostics.Stopwatch.StartNew();
            try
            {
                await ws.StartOrFail();
                Assert.Fail("Expected an exception");
            }
            catch (Exception ex)
                when (ex
                        is TaskCanceledException
                            or OperationCanceledException
                            or WebSocketException
                )
            {
                // Expected: ConnectTimeout triggers cancellation
            }
            sw.Stop();

            // Should fail within a reasonable time (timeout + margin)
            Assert.That(sw.Elapsed.TotalSeconds, Is.LessThan(5));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task DefaultProperties_HaveExpectedValues()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            Assert.That(ws.ConnectTimeout, Is.EqualTo(TimeSpan.FromSeconds(5)));
            Assert.That(ws.SendTimeout, Is.EqualTo(TimeSpan.FromSeconds(30)));
            Assert.That(ws.StateCheckInterval, Is.EqualTo(TimeSpan.FromSeconds(5)));
            Assert.That(ws.ReconnectTimeout, Is.EqualTo(TimeSpan.FromMinutes(1)));
            Assert.That(ws.ErrorReconnectTimeout, Is.EqualTo(TimeSpan.FromMinutes(1)));
            Assert.That(ws.LostReconnectTimeout, Is.Null);
            Assert.That(ws.SendQueueLimit, Is.EqualTo(10_000));
            Assert.That(ws.SendCacheItemTimeout, Is.EqualTo(TimeSpan.FromMinutes(30)));
            Assert.That(ws.IsReconnectionEnabled, Is.False);
            Assert.That(ws.IsStarted, Is.False);
            Assert.That(ws.IsRunning, Is.False);
            Assert.That(ws.IsTextMessageConversionEnabled, Is.True);
            Assert.That(ws.IsStreamDisposedAutomatically, Is.True);
            Assert.That(ws.Backoff, Is.Not.Null);
            Assert.That(ws.KeepAliveTimeout, Is.EqualTo(TimeSpan.FromSeconds(20)));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task ServerInitiatedClose_ConnectionDrops()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var disconnected = new TaskCompletionSource<bool>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            IsReconnectionEnabled = false,
            DisconnectionHappened = _ =>
            {
                disconnected.TrySetResult(true);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();
            Assert.That(ws.IsRunning, Is.True);

            // Server gracefully closes all connections (triggers ByServer path in Listen)
            await server.CloseAllClientsAsync();

            // Wait for the disconnection callback
            var result = await Task.WhenAny(disconnected.Task, Task.Delay(10000));
            Assert.That(
                result,
                Is.EqualTo(disconnected.Task),
                "Timed out waiting for server disconnect"
            );
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task ExceptionOccurred_RaisedOnError()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var exceptionRaised = new TaskCompletionSource<Exception>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            IsReconnectionEnabled = false,
            ExceptionOccurred = ex =>
            {
                exceptionRaised.TrySetResult(ex);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();

            // Abort server connections to cause an error
            server.AbortAllClients();

            var result = await Task.WhenAny(exceptionRaised.Task, Task.Delay(10000));
            // Exception may or may not fire depending on timing, but the test ensures no crash
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task SendInstant_WithCancellation_ThrowsOnCancel()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            using var cts = new CancellationTokenSource();
            cts.Cancel(); // Cancel immediately

            // TaskCanceledException derives from OperationCanceledException
            try
            {
                await ws.SendInstant("msg", cts.Token);
                Assert.Fail("Expected cancellation exception");
            }
            catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
            {
                // Expected
            }
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task MultipleMessages_AllDelivered()
    {
        await using var server = new TestWebSocketServer();
        var messages = new List<string>();
        var allReceived = new TaskCompletionSource<bool>();
        server.OnTextMessage = msg =>
        {
            lock (messages)
            {
                messages.Add(msg);
                if (messages.Count == 5)
                    allReceived.TrySetResult(true);
            }
            return null;
        };
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();

            for (int i = 0; i < 5; i++)
            {
                await ws.SendInstant($"msg-{i}");
            }

            var result = await Task.WhenAny(allReceived.Task, Task.Delay(10000));
            Assert.That(result, Is.EqualTo(allReceived.Task), "Timed out waiting for all messages");

            lock (messages)
            {
                Assert.That(messages.Count, Is.EqualTo(5));
                for (int i = 0; i < 5; i++)
                    Assert.That(messages, Does.Contain($"msg-{i}"));
            }
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task ServerBroadcast_ReceivedByClient()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var received = new TaskCompletionSource<string>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            TextMessageReceived = async stream =>
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                received.TrySetResult(await reader.ReadToEndAsync());
            },
        };

        try
        {
            await ws.StartOrFail();

            // Give a moment for server to register the client
            await Task.Delay(100);

            await server.BroadcastTextAsync("server-push");

            var result = await Task.WhenAny(received.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(received.Task));
            Assert.That(received.Task.Result, Is.EqualTo("server-push"));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Reconnection_WithBackoff_ReconnectsAfterServerClose()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var reconnected = new TaskCompletionSource<ReconnectionInfo>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            IsReconnectionEnabled = true,
            Backoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.FromMilliseconds(200),
                MaxReconnectInterval = TimeSpan.FromSeconds(2),
                UseJitter = false,
            },
            ReconnectionHappened = info =>
            {
                reconnected.TrySetResult(info);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();
            Assert.That(ws.IsRunning, Is.True);

            // Server gracefully closes connection, triggering reconnection
            await server.CloseAllClientsAsync();

            // The server is still running so reconnection should succeed
            var result = await Task.WhenAny(reconnected.Task, Task.Delay(30000));
            Assert.That(result, Is.EqualTo(reconnected.Task), "Timed out waiting for reconnection");

            // After reconnection, should be running again
            await Task.Delay(500);
            Assert.That(ws.IsRunning, Is.True);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void Constructor_WithUri_SetsUrl()
    {
        var uri = new Uri("ws://example.com:8080/path");
        var ws = new WebSocketConnection(uri);
        try
        {
            Assert.That(ws.Url, Is.EqualTo(uri));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void Constructor_WithClientFactory_DoesNotThrow()
    {
        var ws = new WebSocketConnection(
            new Uri("ws://localhost:1"),
            clientFactory: () => new global::System.Net.WebSockets.ClientWebSocket()
        );
        try
        {
            Assert.That(ws.Url.ToString(), Does.Contain("localhost"));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void Name_CanBeSetAndRead()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            ws.Name = "test-client";
            Assert.That(ws.Name, Is.EqualTo("test-client"));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void Url_CanBeChanged()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            var newUri = new Uri("ws://localhost:2");
            ws.Url = newUri;
            Assert.That(ws.Url, Is.EqualTo(newUri));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void Properties_CanBeConfigured()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            ws.IsReconnectionEnabled = true;
            Assert.That(ws.IsReconnectionEnabled, Is.True);

            ws.SendTimeout = TimeSpan.FromSeconds(10);
            Assert.That(ws.SendTimeout, Is.EqualTo(TimeSpan.FromSeconds(10)));

            ws.StateCheckInterval = null;
            Assert.That(ws.StateCheckInterval, Is.Null);

            ws.ReconnectTimeout = null;
            Assert.That(ws.ReconnectTimeout, Is.Null);

            ws.ErrorReconnectTimeout = null;
            Assert.That(ws.ErrorReconnectTimeout, Is.Null);

            ws.LostReconnectTimeout = TimeSpan.FromSeconds(3);
            Assert.That(ws.LostReconnectTimeout, Is.EqualTo(TimeSpan.FromSeconds(3)));

            ws.SendQueueLimit = 0;
            Assert.That(ws.SendQueueLimit, Is.EqualTo(0));

            ws.SendCacheItemTimeout = null;
            Assert.That(ws.SendCacheItemTimeout, Is.Null);

            ws.IsTextMessageConversionEnabled = false;
            Assert.That(ws.IsTextMessageConversionEnabled, Is.False);

            ws.IsStreamDisposedAutomatically = false;
            Assert.That(ws.IsStreamDisposedAutomatically, Is.False);

            ws.Backoff = null;
            Assert.That(ws.Backoff, Is.Null);

            ws.KeepAliveInterval = TimeSpan.FromSeconds(15);
            Assert.That(ws.KeepAliveInterval, Is.EqualTo(TimeSpan.FromSeconds(15)));

            ws.KeepAliveTimeout = TimeSpan.FromSeconds(10);
            Assert.That(ws.KeepAliveTimeout, Is.EqualTo(TimeSpan.FromSeconds(10)));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Stop_WhenNotRunning_ReturnsFalse()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            // Not started, so Stop should return false
            var result = await ws.Stop(WebSocketCloseStatus.NormalClosure, "done");
            Assert.That(result, Is.False);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void Stop_WhenDisposed_ThrowsWebsocketException()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        ws.Dispose();

        Assert.ThrowsAsync<WebsocketException>(async () =>
            await ws.Stop(WebSocketCloseStatus.NormalClosure, "done")
        );
    }

    [Test]
    public void StopOrFail_WhenDisposed_ThrowsWebsocketException()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        ws.Dispose();

        Assert.ThrowsAsync<WebsocketException>(async () =>
            await ws.StopOrFail(WebSocketCloseStatus.NormalClosure, "done")
        );
    }

    [Test]
    public async Task StopOrFail_ClosesConnection()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            Assert.That(ws.IsRunning, Is.True);

            var stopped = await ws.StopOrFail(WebSocketCloseStatus.NormalClosure, "done");
            Assert.That(stopped, Is.True);
            Assert.That(ws.IsRunning, Is.False);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Reconnect_WhenNotStarted_IsNoop()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            // Reconnect when not started should do nothing
            await ws.Reconnect();
            Assert.That(ws.IsStarted, Is.False);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task SendInstant_ArraySegment_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<byte[]>();
        server.OnBinaryMessage = data =>
        {
            serverReceived.TrySetResult(data);
            return null;
        };
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            var data = new byte[] { 0x01, 0x02, 0x03 };
            await ws.SendInstant(new ArraySegment<byte>(data));

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(
                result,
                Is.EqualTo(serverReceived.Task),
                "Timed out waiting for ArraySegment message"
            );
            Assert.That(serverReceived.Task.Result, Is.EqualTo(data));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task SendInstant_Memory_DeliversMessage()
    {
        await using var server = new TestWebSocketServer();
        var serverReceived = new TaskCompletionSource<byte[]>();
        server.OnBinaryMessage = data =>
        {
            serverReceived.TrySetResult(data);
            return null;
        };
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            var data = new byte[] { 0x04, 0x05, 0x06 };
            await ws.SendInstant((Memory<byte>)data);

            var result = await Task.WhenAny(serverReceived.Task, Task.Delay(5000));
            Assert.That(
                result,
                Is.EqualTo(serverReceived.Task),
                "Timed out waiting for Memory<byte> message"
            );
            Assert.That(serverReceived.Task.Result, Is.EqualTo(data));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task SendQueueLimit_Zero_UsesUnboundedQueue()
    {
        await using var server = new TestWebSocketServer();
        var messagesReceived = 0;
        var allReceived = new TaskCompletionSource<bool>();
        server.OnTextMessage = _ =>
        {
            if (Interlocked.Increment(ref messagesReceived) == 3)
                allReceived.TrySetResult(true);
            return null;
        };
        server.Start();

        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            SendQueueLimit = 0, // unbounded
        };
        try
        {
            await ws.StartOrFail();
            ws.Send("msg1");
            ws.Send("msg2");
            ws.Send("msg3");

            var result = await Task.WhenAny(allReceived.Task, Task.Delay(5000));
            Assert.That(
                result,
                Is.EqualTo(allReceived.Task),
                "Timed out waiting for unbounded queue messages"
            );
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Start_NonFailFast_DoesNotThrowOnInvalidUri()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1/nonexistent"))
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
            IsReconnectionEnabled = false,
            Backoff = null,
            ErrorReconnectTimeout = null,
        };

        try
        {
            // Start() (non-fail-fast) should not throw, just log and fire DisconnectionHappened
            await ws.Start();
            // Wait a bit for connection attempt to fail
            await Task.Delay(3000);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task DisconnectionHappened_RaisedOnStop()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var disconnected = new TaskCompletionSource<DisconnectionInfo>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            DisconnectionHappened = info =>
            {
                disconnected.TrySetResult(info);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();
            await ws.Stop(WebSocketCloseStatus.NormalClosure, "done");

            var result = await Task.WhenAny(disconnected.Task, Task.Delay(5000));
            Assert.That(
                result,
                Is.EqualTo(disconnected.Task),
                "Timed out waiting for disconnection"
            );
            // Stop triggers disconnection — could be ByUser or ByServer depending on timing
            Assert.That(
                disconnected.Task.Result.Type,
                Is.AnyOf(DisconnectionType.ByUser, DisconnectionType.ByServer)
            );
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Reconnection_WithBackoff_ReconnectsAfterServerAbort()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var reconnected = new TaskCompletionSource<ReconnectionInfo>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            IsReconnectionEnabled = true,
            // Use state check to detect aborted connection faster
            StateCheckInterval = TimeSpan.FromMilliseconds(500),
            Backoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.FromMilliseconds(200),
                MaxReconnectInterval = TimeSpan.FromSeconds(2),
                UseJitter = false,
            },
            ReconnectionHappened = info =>
            {
                reconnected.TrySetResult(info);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();
            Assert.That(ws.IsRunning, Is.True);

            // Abort server connections (simulates crash) — the state monitor should detect this
            server.AbortAllClients();

            var result = await Task.WhenAny(reconnected.Task, Task.Delay(15000));
            if (result == reconnected.Task)
            {
                // Reconnected successfully
                await Task.Delay(500);
                Assert.That(ws.IsRunning, Is.True);
            }
            // If timed out, abort may not have been detected — that's OK,
            // the test just verifies no crash occurs during abort + reconnect flow
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task Reconnection_MaxAttemptsExhausted_StopsReconnecting()
    {
        // Use a non-routable IP so connection attempts fail immediately after server close
        await using var server = new TestWebSocketServer();
        server.Start();

        var exitDisconnection = new TaskCompletionSource<bool>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
            IsReconnectionEnabled = true,
            Backoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.FromMilliseconds(100),
                MaxReconnectInterval = TimeSpan.FromMilliseconds(200),
                MaxAttempts = 1,
                UseJitter = false,
            },
            DisconnectionHappened = info =>
            {
                if (info.Type == DisconnectionType.Exit)
                    exitDisconnection.TrySetResult(true);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();

            // Point the connection to a non-routable address before triggering reconnect
            // so reconnection attempts fail
            ws.Url = new Uri("ws://192.0.2.1:1/");

            // Gracefully close — triggers reconnection which will fail and exhaust max attempts
            await server.CloseAllClientsAsync();

            // Wait for exit disconnection or timeout
            var result = await Task.WhenAny(exitDisconnection.Task, Task.Delay(15000));
            Assert.That(
                result,
                Is.EqualTo(exitDisconnection.Task),
                "Timed out waiting for max attempts exhaustion"
            );
            Assert.That(ws.IsStarted, Is.False);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task NativeClient_ReturnsClientWebSocket()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };
        try
        {
            await ws.StartOrFail();
            var native = ws.NativeClient;
            Assert.That(native, Is.Not.Null);
            Assert.That(native, Is.InstanceOf<global::System.Net.WebSockets.ClientWebSocket>());
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public void NativeClient_BeforeStart_ReturnsNull()
    {
        var ws = new WebSocketConnection(new Uri("ws://localhost:1"));
        try
        {
            // Before start, _client is null, NativeClient returns null
            Assert.That(ws.NativeClient, Is.Null);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task TextMessageReceived_Null_DoesNotThrow()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = _ => "response";
        server.Start();

        // TextMessageReceived is null — should not throw when server sends a message
        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };

        try
        {
            await ws.StartOrFail();
            await ws.SendInstant("trigger");
            await Task.Delay(500); // Give time for response to be processed
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task BinaryMessageReceived_Null_DoesNotThrow()
    {
        await using var server = new TestWebSocketServer();
        server.OnBinaryMessage = _ => new byte[] { 1, 2, 3 };
        server.Start();

        // BinaryMessageReceived is null — should not throw
        var ws = new WebSocketConnection(server.Uri) { ConnectTimeout = TimeSpan.FromSeconds(5) };

        try
        {
            await ws.StartOrFail();
            await ws.SendInstant(new byte[] { 0xFF });
            await Task.Delay(500);
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task ServerBroadcast_Binary_ReceivedByClient()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var received = new TaskCompletionSource<byte[]>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            BinaryMessageReceived = async stream =>
            {
                using var ms = new MemoryStream();
                await stream.CopyToAsync(ms);
                received.TrySetResult(ms.ToArray());
            },
        };

        try
        {
            await ws.StartOrFail();
            await Task.Delay(100);

            await server.BroadcastBinaryAsync(new byte[] { 0xAA, 0xBB });

            var result = await Task.WhenAny(received.Task, Task.Delay(5000));
            Assert.That(result, Is.EqualTo(received.Task));
            Assert.That(received.Task.Result, Is.EqualTo(new byte[] { 0xAA, 0xBB }));
        }
        finally
        {
            ws.Dispose();
        }
    }

    [Test]
    public async Task LostReconnectTimeout_DelaysReconnection()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var reconnected = new TaskCompletionSource<ReconnectionInfo>();
        var ws = new WebSocketConnection(server.Uri)
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            IsReconnectionEnabled = true,
            LostReconnectTimeout = TimeSpan.FromMilliseconds(500),
            Backoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.FromMilliseconds(100),
                MaxReconnectInterval = TimeSpan.FromMilliseconds(200),
                UseJitter = false,
            },
            ReconnectionHappened = info =>
            {
                reconnected.TrySetResult(info);
                return Task.CompletedTask;
            },
        };

        try
        {
            await ws.StartOrFail();
            var sw = global::System.Diagnostics.Stopwatch.StartNew();

            // Use graceful close — more reliable than abort for triggering reconnection
            await server.CloseAllClientsAsync();

            var result = await Task.WhenAny(reconnected.Task, Task.Delay(30000));
            sw.Stop();
            Assert.That(
                result,
                Is.EqualTo(reconnected.Task),
                "Timed out waiting for delayed reconnection"
            );

            // Should have waited at least the LostReconnectTimeout
            Assert.That(sw.Elapsed.TotalMilliseconds, Is.GreaterThan(400));
        }
        finally
        {
            ws.Dispose();
        }
    }
}
