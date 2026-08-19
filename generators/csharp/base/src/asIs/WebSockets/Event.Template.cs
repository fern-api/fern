// ReSharper disable UnusedMember.Global
namespace <%= namespace%>.WebSockets;

/// <summary>
/// Wraps an event that can be subscribed to and can be invoked.
/// Provides thread-safe event handling with support for both synchronous and asynchronous event handlers.
/// </summary>
/// <typeparam name="T">The type of event data passed to event handlers.</typeparam>
public class Event<T> : IDisposable
{
    private readonly object _lock = new();
    private readonly HashSet<Action<T>> _subscribers = [];
    private readonly HashSet<Func<T, global::System.Threading.Tasks.Task>> _subscribersAsync = [];

    /// <summary>
    /// Initializes a new instance of the Event class.
    /// </summary>
    internal Event() { }

    /// <summary>
    /// Raises the event by invoking all registered synchronous and asynchronous event handlers.
    /// </summary>
    /// <param name="eventObject">The event data to pass to all handlers.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    internal async global::System.Threading.Tasks.Task RaiseEvent(T eventObject)
    {
        Action<T>[] syncSnapshot;
        Func<T, global::System.Threading.Tasks.Task>[] asyncSnapshot;
        lock (_lock)
        {
            syncSnapshot = [.. _subscribers];
            asyncSnapshot = [.. _subscribersAsync];
        }

        foreach (var subscriber in syncSnapshot)
        {
            subscriber.Invoke(eventObject);
        }

        foreach (var subscriber in asyncSnapshot)
        {
            await subscriber.Invoke(eventObject).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Subscribes a synchronous event handler to the event.
    /// </summary>
    /// <param name="eventHandler">The synchronous event handler to subscribe.</param>
    public void Subscribe(Action<T> eventHandler)
    {
        lock (_lock)
        {
            _subscribers.Add(eventHandler);
        }
    }

    /// <summary>
    /// Subscribes an asynchronous event handler to the event.
    /// </summary>
    /// <param name="eventHandler">The asynchronous event handler to subscribe.</param>
    public void Subscribe(Func<T, global::System.Threading.Tasks.Task> eventHandler)
    {
        lock (_lock)
        {
            _subscribersAsync.Add(eventHandler);
        }
    }

    /// <summary>
    /// Unsubscribes a synchronous event handler from the event.
    /// </summary>
    /// <param name="eventHandler">The synchronous event handler to unsubscribe.</param>
    public void Unsubscribe(Action<T> eventHandler)
    {
        lock (_lock)
        {
            _subscribers.Remove(eventHandler);
        }
    }

    /// <summary>
    /// Unsubscribes an asynchronous event handler from the event.
    /// </summary>
    /// <param name="eventHandler">The asynchronous event handler to unsubscribe.</param>
    public void Unsubscribe(Func<T, global::System.Threading.Tasks.Task> eventHandler)
    {
        lock (_lock)
        {
            _subscribersAsync.Remove(eventHandler);
        }
    }

    /// <summary>
    /// Unsubscribes all event handlers from the event.
    /// </summary>
    public void UnsubscribeAll()
    {
        lock (_lock)
        {
            _subscribers.Clear();
            _subscribersAsync.Clear();
        }
    }

    /// <summary>
    /// Disposes of the event by unsubscribing all event handlers.
    /// </summary>
    public void Dispose() => UnsubscribeAll();
}
