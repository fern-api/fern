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
    /// Defaults to <c>5</c> when <c>null</c>.
    /// </param>
    /// <param name="disableReconnection">
    /// When <c>true</c>, reconnection is disabled and the stream ends on premature EOF.
    /// </param>
    /// <param name="terminator">
    /// The SSE data value that signals the end of the stream.
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
                        hasNext = await enumerator
                            .MoveNextAsync()
                            .ConfigureAwait(false);
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

            if (
                disableReconnection
                || string.IsNullOrEmpty(parser.LastEventId)
                || reconnectAttempts >= maxAttempts
            )
            {
                if (streamDropped && !disableReconnection)
                {
                    throw new IOException(
                        "SSE stream connection lost and reconnection failed: "
                            + "no last event ID available or max reconnect attempts reached."
                    );
                }
                yield break;
            }

            reconnectAttempts++;

            var delay = parser.ReconnectionInterval;
            if (delay > MaxReconnectDelay)
            {
                delay = MaxReconnectDelay;
            }
            if (delay > TimeSpan.Zero)
            {
                await global::System
                    .Threading.Tasks.Task.Delay(delay, cancellationToken)
                    .ConfigureAwait(false);
            }

            if (isReconnectedResponse)
            {
                response.Raw?.Dispose();
            }

            response = await reconnectFn(parser.LastEventId, cancellationToken)
                .ConfigureAwait(false);
            isReconnectedResponse = true;
        }
    }
}
