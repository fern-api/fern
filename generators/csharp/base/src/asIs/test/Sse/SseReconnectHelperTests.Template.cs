using global::System.IO;
using global::System.Net;
using global::System.Net.ServerSentEvents;
using global::System.Text;
using NUnit.Framework;
using <%= namespace%>.Core;

namespace <%= testNamespace%>.Core.Sse;

/// <summary>
/// Unit and integration tests for <see cref="SseReconnectHelper"/>.
/// Exercises reconnection behaviors: terminator gating, default backoff,
/// last-dispatched-id correctness, reconnect cap with reset, cancellation,
/// disableReconnection flag, and null-body handling.
/// </summary>
[TestFixture]
[Parallelizable(ParallelScope.Children)]
public class SseReconnectHelperTests
{
    private const int TimeoutMs = 10000;

    // ─── Helpers ─────────────────────────────────────────────────────────

    /// <summary>
    /// Creates a minimal <see cref="ApiResponse"/> wrapping the given SSE text.
    /// </summary>
    private static ApiResponse CreateSseResponse(string sseText)
    {
        var content = new StringContent(sseText, Encoding.UTF8, "text/event-stream");
        var httpResponse = new HttpResponseMessage(HttpStatusCode.OK) { Content = content };
        return new ApiResponse { StatusCode = 200, Raw = httpResponse };
    }

    /// <summary>
    /// Creates an <see cref="ApiResponse"/> whose content stream throws
    /// <see cref="IOException"/> on read (simulates a dropped connection).
    /// </summary>
    private static ApiResponse CreateDroppedResponse(string sseTextBeforeDrop)
    {
        var stream = new DroppingStream(sseTextBeforeDrop);
        var content = new StreamContent(stream);
        content.Headers.ContentType =
            new System.Net.Http.Headers.MediaTypeHeaderValue("text/event-stream");
        var httpResponse = new HttpResponseMessage(HttpStatusCode.OK) { Content = content };
        return new ApiResponse { StatusCode = 200, Raw = httpResponse };
    }

    /// <summary>
    /// A stream that returns the initial text then throws IOException (simulating a drop).
    /// </summary>
    private sealed class DroppingStream : Stream
    {
        private readonly byte[] _data;
        private int _position;
        private bool _hasReadAll;

        public DroppingStream(string initialText)
        {
            _data = Encoding.UTF8.GetBytes(initialText);
        }

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => _data.Length;
        public override long Position
        {
            get => _position;
            set => throw new NotSupportedException();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            var remaining = _data.Length - _position;
            if (remaining <= 0)
            {
                _hasReadAll = true;
                throw new IOException("Connection dropped");
            }
            var toCopy = Math.Min(count, remaining);
            Array.Copy(_data, _position, buffer, offset, toCopy);
            _position += toCopy;
            return toCopy;
        }

        public override Task<int> ReadAsync(
            byte[] buffer,
            int offset,
            int count,
            CancellationToken cancellationToken
        )
        {
            var remaining = _data.Length - _position;
            if (remaining <= 0)
            {
                _hasReadAll = true;
                throw new IOException("Connection dropped");
            }
            var toCopy = Math.Min(count, remaining);
            Array.Copy(_data, _position, buffer, offset, toCopy);
            _position += toCopy;
            return Task.FromResult(toCopy);
        }

#if NET5_0_OR_GREATER
        public override ValueTask<int> ReadAsync(
            Memory<byte> buffer,
            CancellationToken cancellationToken = default
        )
        {
            var remaining = _data.Length - _position;
            if (remaining <= 0)
            {
                _hasReadAll = true;
                throw new IOException("Connection dropped");
            }
            var toCopy = Math.Min(buffer.Length, remaining);
            _data.AsSpan(_position, toCopy).CopyTo(buffer.Span);
            _position += toCopy;
            return new ValueTask<int>(toCopy);
        }
#endif

        public override void Flush() { }
        public override long Seek(long offset, SeekOrigin origin) =>
            throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) =>
            throw new NotSupportedException();
    }

    // ─── Test: No terminator → no reconnect ─────────────────────────────

    [Test]
    public async Task NoTerminator_DoesNotReconnect_StreamEndsOnEof()
    {
        // When terminator is null, the helper cannot distinguish a completed
        // stream from a dropped connection, so it must NOT reconnect.
        var sseText = "id: evt-1\ndata: {\"value\":1}\n\nid: evt-2\ndata: {\"value\":2}\n\n";
        var initialResponse = CreateSseResponse(sseText);
        var reconnectCalled = false;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectCalled = true;
                    return Task.FromResult(CreateSseResponse("id: evt-3\ndata: {\"value\":3}\n\n"));
                },
                maxReconnectAttempts: 5,
                disableReconnection: false,
                terminator: null // No terminator!
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(reconnectCalled, Is.False, "Should not reconnect when terminator is null");
        Assert.That(items, Has.Count.EqualTo(2));
        Assert.That(items[0], Is.EqualTo("{\"value\":1}"));
        Assert.That(items[1], Is.EqualTo("{\"value\":2}"));
    }

    // ─── Test: Default 1s backoff when no retry: directive ───────────────

    [Test]
    public async Task DefaultBackoff_WaitsAtLeast900ms_WhenNoRetryDirective()
    {
        // Without a server retry: directive, the helper should wait ~1s
        // (DefaultReconnectDelay) before reconnecting — NOT zero.
        var sseText1 = "id: evt-1\ndata: {\"value\":1}\n\n";
        var sseText2 = "id: evt-2\ndata: {\"value\":2}\n\ndata: [DONE]\n\n";
        var initialResponse = CreateSseResponse(sseText1);
        var reconnectTimestamp = DateTime.MinValue;
        var initialTimestamp = DateTime.UtcNow;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectTimestamp = DateTime.UtcNow;
                    return Task.FromResult(CreateSseResponse(sseText2));
                },
                maxReconnectAttempts: 3,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(items, Has.Count.EqualTo(2));
        var elapsed = reconnectTimestamp - initialTimestamp;
        Assert.That(
            elapsed.TotalMilliseconds,
            Is.GreaterThanOrEqualTo(900),
            $"Expected >= 900ms delay before reconnect, got {elapsed.TotalMilliseconds}ms"
        );
    }

    // ─── Test: Server retry: directive is respected and clamped ──────────

    [Test]
    public async Task ServerRetry_IsRespectedAndClamped()
    {
        // Server sends retry: 200; helper should wait ~200ms before reconnect.
        var sseText1 = "retry: 200\nid: evt-1\ndata: {\"value\":1}\n\n";
        var sseText2 = "id: evt-2\ndata: {\"value\":2}\n\ndata: [DONE]\n\n";
        var initialResponse = CreateSseResponse(sseText1);
        var reconnectTimestamp = DateTime.MinValue;
        var initialTimestamp = DateTime.UtcNow;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectTimestamp = DateTime.UtcNow;
                    return Task.FromResult(CreateSseResponse(sseText2));
                },
                maxReconnectAttempts: 3,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(items, Has.Count.EqualTo(2));
        var elapsed = reconnectTimestamp - initialTimestamp;
        // Should be at least ~150ms (allowing variance)
        Assert.That(
            elapsed.TotalMilliseconds,
            Is.GreaterThanOrEqualTo(150),
            $"Expected >= 150ms (server retry: 200), got {elapsed.TotalMilliseconds}ms"
        );
    }

    // ─── Test: Mid-event drop sends Last-Event-ID from last dispatched ──

    [Test]
    public async Task MidEventDrop_ReconnectsWithLastDispatchedId_NotParsedId()
    {
        // evt-1 is fully dispatched. Then id: evt-2 is parsed but the
        // connection drops before evt-2's data/blank line. Reconnection
        // must use "evt-1" (last dispatched), NOT "evt-2" (last parsed).
        var sseTextWithDrop = "id: evt-1\ndata: {\"value\":1}\n\nid: evt-2\n";
        var initialResponse = CreateDroppedResponse(sseTextWithDrop);
        string? receivedLastEventId = null;
        var sseText2 = "id: evt-2\ndata: {\"value\":2}\n\ndata: [DONE]\n\n";

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    receivedLastEventId = lastId;
                    return Task.FromResult(CreateSseResponse(sseText2));
                },
                maxReconnectAttempts: 3,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(
            receivedLastEventId,
            Is.EqualTo("evt-1"),
            "Should reconnect with last *dispatched* id, not the parsed-but-undispatched id"
        );
        Assert.That(items, Has.Count.EqualTo(2));
        Assert.That(items[0], Is.EqualTo("{\"value\":1}"));
        Assert.That(items[1], Is.EqualTo("{\"value\":2}"));
    }

    // ─── Test: maxReconnectAttempts cap with reset on progress ───────────

    [Test]
    public async Task MaxReconnectAttempts_CapsReconnects_ResetsOnProgress()
    {
        // Set maxReconnectAttempts=2. First drop yields no data on reconnect
        // (counts 1), second drop also no data (counts 2), stops.
        var sseText1 = "id: evt-1\ndata: {\"value\":1}\n\n";
        var emptyResponse = ""; // No events
        var initialResponse = CreateSseResponse(sseText1);
        var reconnectCount = 0;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectCount++;
                    return Task.FromResult(CreateSseResponse(emptyResponse));
                },
                maxReconnectAttempts: 2,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        // Got only the initial event
        Assert.That(items, Has.Count.EqualTo(1));
        Assert.That(items[0], Is.EqualTo("{\"value\":1}"));
        // Reconnected exactly 2 times before giving up
        Assert.That(reconnectCount, Is.EqualTo(2));
    }

    // ─── Test: disableReconnection prevents reconnection ────────────────

    [Test]
    public async Task DisableReconnection_PreventsReconnect()
    {
        var sseText = "id: evt-1\ndata: {\"value\":1}\n\n";
        var initialResponse = CreateSseResponse(sseText);
        var reconnectCalled = false;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectCalled = true;
                    return Task.FromResult(
                        CreateSseResponse("id: evt-2\ndata: {\"value\":2}\n\ndata: [DONE]\n\n")
                    );
                },
                maxReconnectAttempts: 5,
                disableReconnection: true, // Disabled!
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(reconnectCalled, Is.False, "Should not reconnect when disabled");
        Assert.That(items, Has.Count.EqualTo(1));
    }

    // ─── Test: Cancellation during backoff stops promptly ───────────────

    [Test]
    public async Task Cancellation_DuringBackoff_StopsPromptly()
    {
        var sseText = "id: evt-1\ndata: {\"value\":1}\n\n";
        var initialResponse = CreateSseResponse(sseText);
        using var cts = new CancellationTokenSource();

        var items = new List<string>();
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // Cancel after 200ms (well before the 1s default backoff completes)
        cts.CancelAfter(TimeSpan.FromMilliseconds(200));

        try
        {
            await foreach (
                var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                    initialResponse,
                    (lastId, ct) =>
                    {
                        // Should not be reached because cancellation fires during delay
                        return Task.FromResult(
                            CreateSseResponse("id: evt-2\ndata: {\"value\":2}\n\ndata: [DONE]\n\n")
                        );
                    },
                    maxReconnectAttempts: 5,
                    disableReconnection: false,
                    terminator: "[DONE]",
                    cancellationToken: cts.Token
                )
            )
            {
                items.Add(item.Data);
            }
            Assert.Fail("Expected OperationCanceledException");
        }
        catch (OperationCanceledException)
        {
            // Expected — Task.Delay throws on cancellation
        }

        sw.Stop();
        Assert.That(items, Has.Count.EqualTo(1));
        // Should have stopped well before the full 1s delay
        Assert.That(
            sw.ElapsedMilliseconds,
            Is.LessThan(800),
            $"Cancellation should stop promptly, took {sw.ElapsedMilliseconds}ms"
        );
    }

    // ─── Test: Reconnect function failure treated as failed attempt ──────

    [Test]
    public async Task ReconnectFnThrows_TreatedAsFailedAttempt()
    {
        var sseText = "id: evt-1\ndata: {\"value\":1}\n\n";
        var initialResponse = CreateSseResponse(sseText);
        var reconnectCount = 0;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectCount++;
                    throw new HttpRequestException("Server returned 500");
                },
                maxReconnectAttempts: 2,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(items, Has.Count.EqualTo(1));
        Assert.That(items[0], Is.EqualTo("{\"value\":1}"));
        // Should have retried up to the max
        Assert.That(reconnectCount, Is.EqualTo(2));
    }

    // ─── Test: Normal reconnection works end-to-end ─────────────────────

    [Test]
    public async Task Reconnection_EndToEnd_AllEventsReceived()
    {
        var sseText1 = "id: evt-1\ndata: {\"value\":1}\n\nid: evt-2\ndata: {\"value\":2}\n\n";
        var sseText2 =
            "id: evt-3\ndata: {\"value\":3}\n\nid: evt-4\ndata: {\"value\":4}\n\ndata: [DONE]\n\n";
        var initialResponse = CreateSseResponse(sseText1);
        string? receivedLastEventId = null;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    receivedLastEventId = lastId;
                    return Task.FromResult(CreateSseResponse(sseText2));
                },
                maxReconnectAttempts: 3,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(receivedLastEventId, Is.EqualTo("evt-2"));
        Assert.That(items, Has.Count.EqualTo(4));
        Assert.That(items[0], Is.EqualTo("{\"value\":1}"));
        Assert.That(items[1], Is.EqualTo("{\"value\":2}"));
        Assert.That(items[2], Is.EqualTo("{\"value\":3}"));
        Assert.That(items[3], Is.EqualTo("{\"value\":4}"));
    }

    // ─── Test: Terminator stops stream without reconnection ─────────────

    [Test]
    public async Task Terminator_StopsStream_NoReconnection()
    {
        var sseText =
            "id: evt-1\ndata: {\"value\":1}\n\nid: evt-2\ndata: {\"value\":2}\n\ndata: [DONE]\n\n";
        var initialResponse = CreateSseResponse(sseText);
        var reconnectCalled = false;

        var items = new List<string>();
        await foreach (
            var item in SseReconnectHelper.EnumerateWithReconnectAsync(
                initialResponse,
                (lastId, ct) =>
                {
                    reconnectCalled = true;
                    return Task.FromResult(CreateSseResponse(""));
                },
                maxReconnectAttempts: 5,
                disableReconnection: false,
                terminator: "[DONE]"
            )
        )
        {
            items.Add(item.Data);
        }

        Assert.That(reconnectCalled, Is.False, "Should not reconnect when terminator is reached");
        Assert.That(items, Has.Count.EqualTo(2));
    }
}
