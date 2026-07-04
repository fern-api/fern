using global::System.IO;
using global::System.Net.ServerSentEvents;
using global::System.Runtime.CompilerServices;

namespace SeedServerSentEventsResumable.Core;

/// <summary>
/// Provides SSE stream enumeration with transparent mid-stream reconnection.
/// When a stream ends before the configured terminator and a last event ID is
/// available, this helper reconnects using the <c>Last-Event-ID</c> header.
/// </summary>
internal static class SseReconnectHelper
{
    private const int DefaultMaxReconnectAttempts = 5;
    private static readonly TimeSpan DefaultReconnectDelay = TimeSpan.FromSeconds(1);
    private static readonly TimeSpan MaxReconnectDelay = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Enumerates SSE items from the given response, automatically reconnecting
    /// on premature stream termination when reconnection is enabled.
    /// </summary>
    /// <param name="initialResponse">The initial API response to start reading from.</param>
    /// <param name="reconnectFn">
    /// A delegate that issues a new HTTP request with the <c>Last-Event-ID</c>
    /// header and returns a fresh <see cref="ApiResponse"/>.
    /// </param>
    /// <param name="maxReconnectAttempts">
    /// The maximum number of consecutive reconnection attempts before giving up.
    /// Defaults to <c>5</c> when <c>null</c>. The counter resets to zero each
    /// time a reconnected stream successfully yields at least one event.
    /// </param>
    /// <param name="disableReconnection">
    /// When <c>true</c>, reconnection is disabled and the stream ends on premature EOF.
    /// </param>
    /// <param name="terminator">
    /// The SSE data value that signals the end of the stream. When <c>null</c>,
    /// reconnection is disabled because the client cannot distinguish a completed
    /// stream from a dropped connection.
    /// </param>
    /// <param name="cancellationToken">A token to cancel the enumeration.</param>
    /// <returns>An async enumerable of <see cref="SseItem{T}"/> items.</returns>
    internal static async IAsyncEnumerable<SseItem<string>> EnumerateWithReconnectAsync(
        global::SeedServerSentEventsResumable.Core.ApiResponse initialResponse,
        Func<
            string,
            CancellationToken,
            global::System.Threading.Tasks.Task<global::SeedServerSentEventsResumable.Core.ApiResponse>
        > reconnectFn,
        int? maxReconnectAttempts,
        bool disableReconnection,
        string? terminator,
        [EnumeratorCancellation] CancellationToken cancellationToken = default
    )
    {
        var response = initialResponse;
        var maxAttempts = maxReconnectAttempts ?? DefaultMaxReconnectAttempts;
        var reconnectAttempts = 0;
        var isReconnectedResponse = false;
        // Track the last event ID from the most recently *dispatched* (yielded)
        // event, not the last parsed id. Per the WHATWG EventSource spec the
        // "last event ID" is only committed when an event is dispatched — if a
        // connection drops after an id: line but before the event's terminating
        // blank line, reconnecting with the parsed-but-undispatched id would
        // skip an event that was never delivered to the caller.
        string? lastDispatchedEventId = null;

        while (true)
        {
            var stream = await response
                .Raw.Content.ReadAsStreamAsync(
#if NET5_0_OR_GREATER
                    cancellationToken
#endif
                )
                .ConfigureAwait(false);
            var parser = SseParser.Create(stream);
            var terminatorReached = false;
            var streamDropped = false;

            var enumerator = parser
                .EnumerateAsync(cancellationToken)
                .GetAsyncEnumerator(cancellationToken);
            try
            {
                while (true)
                {
                    bool hasNext;
                    try
                    {
                        hasNext = await enumerator.MoveNextAsync().ConfigureAwait(false);
                    }
                    catch (IOException)
                    {
                        streamDropped = true;
                        break;
                    }

                    if (!hasNext)
                    {
                        break;
                    }

                    var item = enumerator.Current;

                    if (
                        terminator != null
                        && !string.IsNullOrEmpty(item.Data)
                        && item.Data == terminator
                    )
                    {
                        terminatorReached = true;
                        break;
                    }

                    yield return item;
                    // Capture parser.LastEventId immediately after a successful
                    // dispatch — at this point it reflects the just-dispatched
                    // event's id. We must snapshot it before the next
                    // MoveNextAsync could partially update it with a new id:
                    // line from an incomplete event.
                    if (!string.IsNullOrEmpty(parser.LastEventId))
                    {
                        lastDispatchedEventId = parser.LastEventId;
                    }
                    reconnectAttempts = 0;
                }
            }
            finally
            {
                await enumerator.DisposeAsync().ConfigureAwait(false);
            }

            if (terminatorReached)
            {
                yield break;
            }

            // Determine whether reconnection should be attempted.
            // Without a terminator the client cannot distinguish "stream
            // completed" from "connection dropped", so reconnection is disabled.
            if (
                disableReconnection
                || terminator == null
                || string.IsNullOrEmpty(lastDispatchedEventId)
                || reconnectAttempts >= maxAttempts
            )
            {
                if (streamDropped)
                {
                    throw new IOException(
                        "SSE stream connection lost and reconnection was not attempted."
                    );
                }
                yield break;
            }

            reconnectAttempts++;

            // Use the server-sent retry interval if available; otherwise fall
            // back to DefaultReconnectDelay (1s) to avoid hammering the server.
            var delay =
                parser.ReconnectionInterval > TimeSpan.Zero
                    ? parser.ReconnectionInterval
                    : DefaultReconnectDelay;
            if (delay > MaxReconnectDelay)
            {
                delay = MaxReconnectDelay;
            }
            await global::System
                .Threading.Tasks.Task.Delay(delay, cancellationToken)
                .ConfigureAwait(false);

            if (isReconnectedResponse)
            {
                response.Raw?.Dispose();
            }

            try
            {
                response = await reconnectFn(lastDispatchedEventId!, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch
            {
                // Failed reconnect (e.g. HTTP error or null body). Treat as a
                // failed attempt — the next loop iteration will check the cap.
                continue;
            }
            isReconnectedResponse = true;
        }
    }
}
