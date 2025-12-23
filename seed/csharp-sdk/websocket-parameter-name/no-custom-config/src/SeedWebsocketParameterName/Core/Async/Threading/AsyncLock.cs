// ReSharper disable All
// #pragma warning disable
// #pragma warning disable CS8600
// #pragma warning disable CS8619
namespace SeedWebsocketParameterName.Core.Async.Threading;

/// <summary>
/// Provides a convenient wrapper around SemaphoreSlim that enables easy use of locking inside 'using' blocks.
/// Automatically handles the release of the semaphore, eliminating the need to manually manage SemaphoreSlim disposal.
/// Example:
/// <code>
/// using(await _asyncLock.LockAsync())
/// {
///     // do your synchronized work
/// }
/// </code>
/// </summary>
internal class AsyncLock
{
    private readonly Task<IDisposable> _releaserTask;
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private readonly IDisposable _releaser;

    /// <summary>
    /// Initializes a new instance of the AsyncLock class.
    /// Creates a semaphore with a count of 1 and initializes the releaser mechanism.
    /// </summary>
    internal AsyncLock()
    {
        _releaser = new Releaser(_semaphore);
        _releaserTask = Task.FromResult<IDisposable>(_releaser);
    }

    /// <summary>
    /// Acquires the lock synchronously. Use inside a 'using' block to ensure proper disposal.
    /// </summary>
    /// <returns>An IDisposable that releases the lock when disposed.</returns>
    internal IDisposable Lock()
    {
        _semaphore.Wait();
        return _releaser;
    }

    /// <summary>
    /// Acquires the lock asynchronously. Use inside a 'using' block with await to ensure proper disposal.
    /// </summary>
    /// <returns>A task that represents the asynchronous lock acquisition and returns an IDisposable that releases the lock when disposed.</returns>
    internal Task<IDisposable> LockAsync()
    {
        var waitTask = _semaphore.WaitAsync();
        return waitTask.IsCompleted
            ? _releaserTask
            : waitTask.ContinueWith(
                (_, releaser) => (IDisposable)releaser!,
                _releaser,
                CancellationToken.None,
                TaskContinuationOptions.ExecuteSynchronously,
                TaskScheduler.Default
            );
    }

    /// <summary>
    /// Internal class that handles the release of the semaphore when disposed.
    /// </summary>
    private class Releaser : IDisposable
    {
        private readonly SemaphoreSlim _semaphore;

        /// <summary>
        /// Initializes a new instance of the Releaser class.
        /// </summary>
        /// <param name="semaphore">The semaphore to release when disposed.</param>
        public Releaser(SemaphoreSlim semaphore)
        {
            _semaphore = semaphore;
        }

        /// <summary>
        /// Releases the semaphore.
        /// </summary>
        public void Dispose()
        {
            _semaphore.Release();
        }
    }
}
