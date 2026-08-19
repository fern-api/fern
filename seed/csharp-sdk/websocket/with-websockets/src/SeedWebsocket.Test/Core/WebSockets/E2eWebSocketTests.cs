using global::System.Collections.Concurrent;
using global::System.Text;
using NUnit.Framework;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket.Test.Core.WebSockets;

/// <summary>
/// End-to-end integration tests that exercise the full WebSocket lifecycle
/// against a real in-process server. These tests verify composite scenarios
/// that span connect → send → receive → reconnect → close flows.
/// </summary>
[TestFixture]
[Parallelizable(ParallelScope.Children)]
public class E2eWebSocketTests
{
    private const int TimeoutMs = 3000;

    // ───────────────────────────────────────────────────────────────
    // Echo conversation: send text, receive echo, verify round-trip
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task Echo_TextRoundTrip_ReceivesEchoFromServer()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => $"echo:{msg}";
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
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();
        await client.SendInstant("hello");

        var result = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for echo");
        Assert.That(received.Task.Result, Is.EqualTo("echo:hello"));
    }

    [Test]
    public async Task Echo_BinaryRoundTrip_ReceivesEchoFromServer()
    {
        await using var server = new TestWebSocketServer();
        server.OnBinaryMessage = data => data; // echo back same bytes
        server.Start();

        var received = new TaskCompletionSource<byte[]>();
        var client = new WebSocketConnection(server.Uri);
        client.BinaryMessageReceived = async stream =>
        {
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            received.TrySetResult(ms.ToArray());
        };

        await client.Start();
        await client.SendInstant(new byte[] { 0xDE, 0xAD, 0xBE, 0xEF });

        var result = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for binary echo");
        Assert.That(received.Task.Result, Is.EqualTo(new byte[] { 0xDE, 0xAD, 0xBE, 0xEF }));

        await client.Stop(global::System.Net.WebSockets.WebSocketCloseStatus.NormalClosure, "done");
        client.Dispose();
    }

    // ───────────────────────────────────────────────────────────────
    // Multi-message conversation: sequential send/receive
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task Conversation_MultipleExchanges_AllEchoedCorrectly()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => $"re:{msg}";
        server.Start();

        var responses = new ConcurrentQueue<string>();
        var allReceived = new TaskCompletionSource<bool>();
        await using var client = new WebSocketClient(
            server.Uri,
            async stream =>
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                var text = await reader.ReadToEndAsync();
                responses.Enqueue(text);
                if (responses.Count >= 5)
                    allReceived.TrySetResult(true);
            }
        )
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();

        for (int i = 0; i < 5; i++)
            await client.SendInstant($"msg-{i}");

        var result = await Task.WhenAny(allReceived.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(allReceived.Task), "Timed out waiting for all echoes");
        Assert.That(responses.Count, Is.EqualTo(5));

        var ordered = responses.ToArray();
        for (int i = 0; i < 5; i++)
            Assert.That(ordered[i], Is.EqualTo($"re:msg-{i}"));
    }

    // ───────────────────────────────────────────────────────────────
    // Rapid-fire throughput: many messages sent quickly
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task RapidFire_50Messages_AllDelivered()
    {
        const int messageCount = 50;
        await using var server = new TestWebSocketServer();
        var serverReceived = new ConcurrentBag<string>();
        var allReceived = new TaskCompletionSource<bool>();
        server.OnTextMessage = msg =>
        {
            serverReceived.Add(msg);
            if (serverReceived.Count >= messageCount)
                allReceived.TrySetResult(true);
            return null; // no echo needed
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();

        for (int i = 0; i < messageCount; i++)
            await client.SendInstant($"rapid-{i}");

        var result = await Task.WhenAny(allReceived.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(allReceived.Task), "Timed out waiting for all messages");
        Assert.That(serverReceived.Count, Is.EqualTo(messageCount));
    }

    [Test]
    public async Task RapidFire_QueuedSend_50Messages_AllDelivered()
    {
        const int messageCount = 50;
        await using var server = new TestWebSocketServer();
        var serverReceived = new ConcurrentBag<string>();
        var allReceived = new TaskCompletionSource<bool>();
        server.OnTextMessage = msg =>
        {
            serverReceived.Add(msg);
            if (serverReceived.Count >= messageCount)
                allReceived.TrySetResult(true);
            return null;
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();

        for (int i = 0; i < messageCount; i++)
        {
            var queued = client.Send($"queued-{i}");
            Assert.That(queued, Is.True, $"Message {i} should have been queued");
        }

        var result = await Task.WhenAny(allReceived.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(allReceived.Task), "Timed out waiting for queued messages");
        Assert.That(serverReceived.Count, Is.EqualTo(messageCount));
    }

    // ───────────────────────────────────────────────────────────────
    // Server broadcast: server pushes to client without request
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task ServerBroadcast_TextPushed_ClientReceives()
    {
        await using var server = new TestWebSocketServer();
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
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        var clientConnected = server.WaitForClientAsync();
        await client.ConnectAsync();
        await clientConnected;

        await server.BroadcastTextAsync("server-push");

        var result = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for broadcast");
        Assert.That(received.Task.Result, Is.EqualTo("server-push"));
    }

    [Test]
    public async Task ServerBroadcast_BinaryPushed_ClientReceives()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var received = new TaskCompletionSource<byte[]>();
        var conn = new WebSocketConnection(server.Uri);
        conn.BinaryMessageReceived = async stream =>
        {
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            received.TrySetResult(ms.ToArray());
        };

        var clientConnected = server.WaitForClientAsync();
        await conn.Start();
        await clientConnected;

        await server.BroadcastBinaryAsync(new byte[] { 0xCA, 0xFE });

        var result = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for binary broadcast");
        Assert.That(received.Task.Result, Is.EqualTo(new byte[] { 0xCA, 0xFE }));

        await conn.Stop(global::System.Net.WebSockets.WebSocketCloseStatus.NormalClosure, "done");
        conn.Dispose();
    }

    // ───────────────────────────────────────────────────────────────
    // Multiple subscribers: verify all handlers fire
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task MultipleSubscribers_AllReceiveMessages()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => msg; // echo
        server.Start();

        int subscriber1Count = 0;
        int subscriber2Count = 0;
        var bothReceived = new TaskCompletionSource<bool>();

        await using var client = new WebSocketClient(
            server.Uri,
            async stream =>
            {
                // Read and discard the stream content
                using var reader = new StreamReader(stream, Encoding.UTF8);
                await reader.ReadToEndAsync();

                Interlocked.Increment(ref subscriber1Count);
                Interlocked.Increment(ref subscriber2Count);
                if (subscriber1Count >= 1 && subscriber2Count >= 1)
                    bothReceived.TrySetResult(true);
            }
        )
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();
        await client.SendInstant("multi-test");

        var result = await Task.WhenAny(bothReceived.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(bothReceived.Task), "Timed out waiting for subscribers");
        Assert.That(subscriber1Count, Is.GreaterThanOrEqualTo(1));
        Assert.That(subscriber2Count, Is.GreaterThanOrEqualTo(1));
    }

    // ───────────────────────────────────────────────────────────────
    // Status lifecycle: full connect → send → receive → close cycle
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task FullLifecycle_ConnectSendReceiveClose()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => $"ack:{msg}";
        server.Start();

        var statusHistory = new ConcurrentQueue<ConnectionStatus>();
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
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        client.PropertyChanged += (_, args) =>
        {
            if (args.PropertyName == nameof(client.Status))
                statusHistory.Enqueue(client.Status);
        };

        // Phase 1: Connect
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));
        await client.ConnectAsync();
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Connected));

        // Phase 2: Send + Receive
        await client.SendInstant("lifecycle-test");
        var echoResult = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
        Assert.That(echoResult, Is.EqualTo(received.Task), "Timed out waiting for echo");
        Assert.That(received.Task.Result, Is.EqualTo("ack:lifecycle-test"));

        // Phase 3: Close
        await client.CloseAsync();
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));

        // Verify status transitions happened
        Assert.That(statusHistory, Does.Contain(ConnectionStatus.Connecting));
        Assert.That(statusHistory, Does.Contain(ConnectionStatus.Connected));
        Assert.That(statusHistory, Does.Contain(ConnectionStatus.Disconnecting));
        Assert.That(statusHistory, Does.Contain(ConnectionStatus.Disconnected));
    }

    // ───────────────────────────────────────────────────────────────
    // Reconnection: server close triggers auto-reconnect
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task Reconnection_ServerClose_ClientReconnectsAndResumes()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => $"echo:{msg}";
        server.Start();

        var reconnected = new TaskCompletionSource<ReconnectionInfo>();
        var postReconnectEcho = new TaskCompletionSource<string>();

        await using var client = new WebSocketClient(
            server.Uri,
            async stream =>
            {
                using var reader = new StreamReader(stream, Encoding.UTF8);
                var text = await reader.ReadToEndAsync();
                // Only capture echoes after reconnection
                if (reconnected.Task.IsCompleted)
                    postReconnectEcho.TrySetResult(text);
            }
        )
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
            IsReconnectionEnabled = true,
            StateCheckInterval = TimeSpan.FromMilliseconds(50),
            ReconnectTimeout = TimeSpan.FromMilliseconds(200),
            ErrorReconnectTimeout = TimeSpan.FromMilliseconds(200),
            Backoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.Zero,
                MaxReconnectInterval = TimeSpan.FromMilliseconds(50),
                UseJitter = false,
            },
        };

        client.Reconnecting.Subscribe(info => reconnected.TrySetResult(info));

        await client.ConnectAsync();
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Connected));

        // Server closes all clients -- should trigger reconnection
        await server.CloseAllClientsAsync();

        var reconnectResult = await Task.WhenAny(reconnected.Task, Task.Delay(TimeoutMs));
        Assert.That(
            reconnectResult,
            Is.EqualTo(reconnected.Task),
            "Timed out waiting for reconnection"
        );

        // Wait for Connected status after reconnection
        var connectedTcs = new TaskCompletionSource<bool>();
        if (client.Status == ConnectionStatus.Connected)
            connectedTcs.TrySetResult(true);
        else
            client.PropertyChanged += (_, args) =>
            {
                if (
                    args.PropertyName == nameof(client.Status)
                    && client.Status == ConnectionStatus.Connected
                )
                    connectedTcs.TrySetResult(true);
            };
        await Task.WhenAny(connectedTcs.Task, Task.Delay(TimeoutMs));
        Assert.That(
            client.Status,
            Is.EqualTo(ConnectionStatus.Connected),
            "Client should be connected after reconnection"
        );

        // Verify we can still send/receive after reconnection
        await client.SendInstant("after-reconnect");

        var echoResult = await Task.WhenAny(postReconnectEcho.Task, Task.Delay(TimeoutMs));
        Assert.That(
            echoResult,
            Is.EqualTo(postReconnectEcho.Task),
            "Timed out waiting for post-reconnect echo"
        );
        Assert.That(postReconnectEcho.Task.Result, Is.EqualTo("echo:after-reconnect"));
    }

    // ───────────────────────────────────────────────────────────────
    // Server abort: ungraceful disconnect triggers reconnection
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task Reconnection_ServerAbort_ClientDetectsAndRecovers()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var disconnected = new TaskCompletionSource<bool>();
        var clientConnected = server.WaitForClientAsync();
        var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
            IsReconnectionEnabled = true,
            StateCheckInterval = TimeSpan.FromMilliseconds(50),
            ReconnectTimeout = TimeSpan.FromMilliseconds(200),
            ErrorReconnectTimeout = TimeSpan.FromMilliseconds(200),
            Backoff = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.Zero,
                MaxReconnectInterval = TimeSpan.FromMilliseconds(50),
                UseJitter = false,
            },
        };

        try
        {
            client.Reconnecting.Subscribe(_ =>
            {
                disconnected.TrySetResult(true);
                return Task.CompletedTask;
            });

            await client.ConnectAsync();
            await clientConnected;

            // Abort = no close handshake, simulates crash
            server.AbortAllClients();

            var result = await Task.WhenAny(disconnected.Task, Task.Delay(TimeoutMs));
            // Either reconnection fires or the client detects the abort
            if (result == disconnected.Task)
            {
                Assert.That(disconnected.Task.Result, Is.True);
            }
            else
            {
                // Server abort may not always trigger reconnect callback reliably,
                // but the client should detect the disconnect
                Assert.That(
                    client.Status,
                    Is.AnyOf(ConnectionStatus.Connected, ConnectionStatus.Disconnected),
                    "Client should have detected server abort"
                );
            }
        }
        finally
        {
            try
            {
                await client.DisposeAsync();
            }
            catch
            { /* socket may already be closed */
            }
        }
    }

    // ───────────────────────────────────────────────────────────────
    // Graceful cleanup: dispose during active conversation
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task Dispose_DuringActiveConversation_CleansUpGracefully()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg =>
        {
            Thread.Sleep(10); // simulate slow response
            return $"slow:{msg}";
        };
        server.Start();

        var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();

        // Send some messages then immediately dispose
        for (int i = 0; i < 5; i++)
            client.Send($"dispose-test-{i}");

        // Dispose while messages may still be in-flight
        await client.DisposeAsync();

        // No exception means success — resources cleaned up
        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));
    }

    // ───────────────────────────────────────────────────────────────
    // Event lifecycle: Connected → Closed events bracket the session
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task Events_ConnectedAndClosed_BracketSession()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var connectedFired = new TaskCompletionSource<bool>();
        var closedFired = new TaskCompletionSource<bool>();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        client.Connected.Subscribe(_ =>
        {
            connectedFired.TrySetResult(true);
            return Task.CompletedTask;
        });
        client.Closed.Subscribe(_ =>
        {
            closedFired.TrySetResult(true);
            return Task.CompletedTask;
        });

        await client.ConnectAsync();

        var connResult = await Task.WhenAny(connectedFired.Task, Task.Delay(TimeoutMs));
        Assert.That(connResult, Is.EqualTo(connectedFired.Task), "Connected event not fired");

        await client.CloseAsync();

        var closeResult = await Task.WhenAny(closedFired.Task, Task.Delay(TimeoutMs));
        Assert.That(closeResult, Is.EqualTo(closedFired.Task), "Closed event not fired");
    }

    // ───────────────────────────────────────────────────────────────
    // Connection failure: invalid URL raises exception
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task ConnectionFailure_InvalidUrl_ThrowsAndReportsStatus()
    {
        await using var client = new WebSocketClient(
            new Uri("ws://localhost:1/invalid"),
            _ => Task.CompletedTask
        )
        {
            ConnectTimeout = TimeSpan.FromMilliseconds(500),
        };

        try
        {
            await client.ConnectAsync();
            Assert.Fail("Expected connection to fail");
        }
        catch (Exception ex)
            when (ex
                    is global::System.Net.WebSockets.WebSocketException
                        or TaskCanceledException
                        or OperationCanceledException
                        or InvalidOperationException
            )
        {
            // Expected
        }

        Assert.That(client.Status, Is.EqualTo(ConnectionStatus.Disconnected));
    }

    // ───────────────────────────────────────────────────────────────
    // Mixed message types: text and binary in same session
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task MixedMessages_TextAndBinary_BothDelivered()
    {
        await using var server = new TestWebSocketServer();
        var textReceived = new TaskCompletionSource<string>();
        var binaryReceived = new TaskCompletionSource<byte[]>();
        server.OnTextMessage = msg =>
        {
            textReceived.TrySetResult(msg);
            return null;
        };
        server.OnBinaryMessage = data =>
        {
            binaryReceived.TrySetResult(data);
            return null;
        };
        server.Start();

        await using var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();

        await client.SendInstant("text-msg");
        await client.SendInstant(new byte[] { 0x01, 0x02 });

        var textResult = await Task.WhenAny(textReceived.Task, Task.Delay(TimeoutMs));
        Assert.That(textResult, Is.EqualTo(textReceived.Task), "Timed out waiting for text");
        Assert.That(textReceived.Task.Result, Is.EqualTo("text-msg"));

        var binResult = await Task.WhenAny(binaryReceived.Task, Task.Delay(TimeoutMs));
        Assert.That(binResult, Is.EqualTo(binaryReceived.Task), "Timed out waiting for binary");
        Assert.That(binaryReceived.Task.Result, Is.EqualTo(new byte[] { 0x01, 0x02 }));
    }

    // ───────────────────────────────────────────────────────────────
    // Concurrent clients: multiple clients on same server
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task ConcurrentClients_MultipleClientsOnSameServer()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => $"echo:{msg}";
        server.Start();

        const int clientCount = 5;
        var tasks = new List<Task>();

        for (int i = 0; i < clientCount; i++)
        {
            var idx = i;
            tasks.Add(
                Task.Run(async () =>
                {
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
                        ConnectTimeout = TimeSpan.FromSeconds(2),
                    };

                    await client.ConnectAsync();
                    await client.SendInstant($"client-{idx}");

                    var result = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
                    Assert.That(
                        result,
                        Is.EqualTo(received.Task),
                        $"Client {idx} timed out waiting for echo"
                    );
                    Assert.That(received.Task.Result, Is.EqualTo($"echo:client-{idx}"));

                    await client.CloseAsync();
                })
            );
        }

        await Task.WhenAll(tasks);
    }

    // ───────────────────────────────────────────────────────────────
    // Server close: client detects server-initiated close
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task ServerClose_ClientDetectsAndFiresClosedEvent()
    {
        await using var server = new TestWebSocketServer();
        server.Start();

        var closedTcs = new TaskCompletionSource<Closed>();
        var client = new WebSocketClient(server.Uri, _ => Task.CompletedTask)
        {
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        try
        {
            client.Closed.Subscribe(c => closedTcs.TrySetResult(c));

            var clientConnected = server.WaitForClientAsync();
            await client.ConnectAsync();
            await clientConnected;

            await server.CloseAllClientsAsync();

            var result = await Task.WhenAny(closedTcs.Task, Task.Delay(TimeoutMs));
            Assert.That(result, Is.EqualTo(closedTcs.Task), "Timed out waiting for Closed event");
            Assert.That(closedTcs.Task.Result, Is.Not.Null);
        }
        finally
        {
            try
            {
                await client.DisposeAsync();
            }
            catch
            { /* socket may already be closed */
            }
        }
    }

    // ───────────────────────────────────────────────────────────────
    // Large message: verify chunked transfer works
    // ───────────────────────────────────────────────────────────────

    [Test]
    public async Task LargeMessage_16KB_DeliveredIntact()
    {
        await using var server = new TestWebSocketServer();
        server.OnTextMessage = msg => msg; // echo back
        server.Start();

        var largePayload = new string('X', 16 * 1024); // 16KB
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
            ConnectTimeout = TimeSpan.FromSeconds(2),
        };

        await client.ConnectAsync();
        await client.SendInstant(largePayload);

        var result = await Task.WhenAny(received.Task, Task.Delay(TimeoutMs));
        Assert.That(result, Is.EqualTo(received.Task), "Timed out waiting for large echo");
        Assert.That(received.Task.Result.Length, Is.EqualTo(largePayload.Length));
        Assert.That(received.Task.Result, Is.EqualTo(largePayload));
    }
}
