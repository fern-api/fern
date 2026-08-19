using global::System.Collections.Generic;
using global::System.Runtime.CompilerServices;
using global::System.Threading;
using global::System.Threading.Tasks;

namespace SeedMultiLineDocs;

/// <summary>
/// A streaming wrapper that provides dual-mode access to a streaming endpoint:
/// - Direct <c>await foreach</c> iterates the parsed stream values (zero-allocation path for common case)
/// - <c>.WithRawResponse()</c> yields the underlying <see cref="WithRawResponse{T}"/> exposing both the stream and raw response metadata
/// </summary>
/// <typeparam name="T">The element type of the parsed stream.</typeparam>
public readonly struct WithRawResponseStream<T> : IAsyncEnumerable<T>
{
    private readonly Task<WithRawResponse<IAsyncEnumerable<T>>> _task;
    private readonly CancellationToken _originalCancellationToken;

    /// <summary>
    /// Creates a new WithRawResponseStream wrapping the given task that opens the underlying HTTP response.
    /// </summary>
    /// <param name="task">The task opening the HTTP response and producing the parsed stream.</param>
    /// <param name="cancellationToken">
    /// The cancellation token supplied at the SDK call site. Linked with any token supplied via
    /// <c>.WithCancellation(...)</c> on the enumerator so both cancel the inner reads.
    /// </param>
    public WithRawResponseStream(
        Task<WithRawResponse<IAsyncEnumerable<T>>> task,
        CancellationToken cancellationToken = default
    )
    {
        _task = task;
        _originalCancellationToken = cancellationToken;
    }

    /// <summary>
    /// Returns the underlying task that yields both the stream and raw response metadata once headers are received.
    /// </summary>
    public Task<WithRawResponse<IAsyncEnumerable<T>>> WithRawResponse() => _task;

    /// <summary>
    /// Returns an enumerator that iterates the parsed stream values. Awaits the underlying HTTP response, then yields each parsed element from the body stream.
    /// </summary>
    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default) =>
        EnumerateAsync(_task, _originalCancellationToken, cancellationToken)
            .GetAsyncEnumerator(cancellationToken);

    private static async IAsyncEnumerable<T> EnumerateAsync(
        Task<WithRawResponse<IAsyncEnumerable<T>>> task,
        CancellationToken originalCancellationToken,
        [EnumeratorCancellation] CancellationToken cancellationToken
    )
    {
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
            originalCancellationToken,
            cancellationToken
        );
        var wrapped = await task.ConfigureAwait(false);
        await foreach (
            var item in wrapped.Data.WithCancellation(linkedCts.Token).ConfigureAwait(false)
        )
        {
            yield return item;
        }
    }
}
