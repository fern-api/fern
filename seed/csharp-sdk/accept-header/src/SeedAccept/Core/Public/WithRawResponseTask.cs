using System.Runtime.CompilerServices;

namespace SeedAccept;

/// <summary>
/// A task-like type that wraps Task&lt;WithRawResponse&lt;T&gt;&gt; and provides dual-mode awaiting:
/// - Direct await yields just T (zero-allocation path for common case)
/// - .WithRawResponse() yields WithRawResponse&lt;T&gt; (when raw response metadata is needed)
/// </summary>
/// <typeparam name="T">The type of the parsed response data.</typeparam>
public readonly struct WithRawResponseTask<T>
{
    private readonly Task<WithRawResponse<T>> _task;

    /// <summary>
    /// Creates a new WithRawResponseTask wrapping the given task.
    /// </summary>
    public WithRawResponseTask(Task<WithRawResponse<T>> task)
    {
        _task = task;
    }

    /// <summary>
    /// Returns the underlying task that yields both the data and raw response metadata.
    /// </summary>
    public Task<WithRawResponse<T>> WithRawResponse() => _task;

    /// <summary>
    /// Gets the custom awaiter that unwraps to just T when awaited.
    /// </summary>
    public Awaiter GetAwaiter() => new(_task.GetAwaiter());

    /// <summary>
    /// Configures the awaiter to continue on the captured context or not.
    /// </summary>
    public ConfiguredTaskAwaitable ConfigureAwait(bool continueOnCapturedContext) =>
        new(_task.ConfigureAwait(continueOnCapturedContext));

    /// <summary>
    /// Implicitly converts WithRawResponseTask&lt;T&gt; to Task&lt;T&gt; for backward compatibility.
    /// The resulting task will yield just the data when awaited.
    /// </summary>
    public static implicit operator Task<T>(WithRawResponseTask<T> task)
    {
        return task._task.ContinueWith(
            t => t.Result.Data,
            TaskContinuationOptions.ExecuteSynchronously
        );
    }

    /// <summary>
    /// Custom awaiter that unwraps WithRawResponse&lt;T&gt; to just T.
    /// </summary>
    public readonly struct Awaiter : ICriticalNotifyCompletion
    {
        private readonly TaskAwaiter<WithRawResponse<T>> _awaiter;

        internal Awaiter(TaskAwaiter<WithRawResponse<T>> awaiter)
        {
            _awaiter = awaiter;
        }

        /// <summary>
        /// Gets whether the underlying task has completed.
        /// </summary>
        public bool IsCompleted => _awaiter.IsCompleted;

        /// <summary>
        /// Gets the result, unwrapping to just the data.
        /// </summary>
        public T GetResult() => _awaiter.GetResult().Data;

        /// <summary>
        /// Schedules the continuation action.
        /// </summary>
        public void OnCompleted(Action continuation) => _awaiter.OnCompleted(continuation);

        /// <summary>
        /// Schedules the continuation action without capturing the execution context.
        /// </summary>
        public void UnsafeOnCompleted(Action continuation) =>
            _awaiter.UnsafeOnCompleted(continuation);
    }

    /// <summary>
    /// Awaitable type returned by ConfigureAwait that unwraps to just T.
    /// </summary>
    public readonly struct ConfiguredTaskAwaitable
    {
        private readonly ConfiguredTaskAwaitable<WithRawResponse<T>> _configuredTask;

        internal ConfiguredTaskAwaitable(ConfiguredTaskAwaitable<WithRawResponse<T>> configuredTask)
        {
            _configuredTask = configuredTask;
        }

        /// <summary>
        /// Gets the configured awaiter that unwraps to just T.
        /// </summary>
        public ConfiguredAwaiter GetAwaiter() => new(_configuredTask.GetAwaiter());

        /// <summary>
        /// Custom configured awaiter that unwraps WithRawResponse&lt;T&gt; to just T.
        /// </summary>
        public readonly struct ConfiguredAwaiter : ICriticalNotifyCompletion
        {
            private readonly ConfiguredTaskAwaitable<
                WithRawResponse<T>
            >.ConfiguredTaskAwaiter _awaiter;

            internal ConfiguredAwaiter(
                ConfiguredTaskAwaitable<WithRawResponse<T>>.ConfiguredTaskAwaiter awaiter
            )
            {
                _awaiter = awaiter;
            }

            /// <summary>
            /// Gets whether the underlying task has completed.
            /// </summary>
            public bool IsCompleted => _awaiter.IsCompleted;

            /// <summary>
            /// Gets the result, unwrapping to just the data.
            /// </summary>
            public T GetResult() => _awaiter.GetResult().Data;

            /// <summary>
            /// Schedules the continuation action.
            /// </summary>
            public void OnCompleted(Action continuation) => _awaiter.OnCompleted(continuation);

            /// <summary>
            /// Schedules the continuation action without capturing the execution context.
            /// </summary>
            public void UnsafeOnCompleted(Action continuation) =>
                _awaiter.UnsafeOnCompleted(continuation);
        }
    }
}
