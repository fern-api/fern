// ReSharper disable UnusedMember.Global
namespace SeedWebsocketParameterName.Core.Async.Events;

/// <summary>
/// Wraps an event that can be subscribed to and can be invoked.
/// Provides thread-safe event handling with support for both synchronous and asynchronous event handlers.
/// </summary>
/// <typeparam name="T">The type of event data passed to event handlers.</typeparam>
public class Event<T> : IDisposable
{
    private readonly HashSet<Action<T>> _subscribers = [];
    private readonly HashSet<Func<T, Task>> _subscribersAsync = [];

    /// <summary>
    /// Initializes a new instance of the Event class.
    /// </summary>
    internal Event() { }

    /// <summary>
    /// Raises the event by invoking all registered synchronous and asynchronous event handlers.
    /// </summary>
    /// <param name="eventObject">The event data to pass to all handlers.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    internal async Task RaiseEvent(T eventObject)
    {
        foreach (var subscriber in _subscribers)
        {
            subscriber.Invoke(eventObject);
        }

        foreach (var subscriber in _subscribersAsync)
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
        _subscribers.Add(eventHandler);
    }

    /// <summary>
    /// Subscribes an asynchronous event handler to the event.
    /// </summary>
    /// <param name="eventHandler">The asynchronous event handler to subscribe.</param>
    public void Subscribe(Func<T, Task> eventHandler)
    {
        _subscribersAsync.Add(eventHandler);
    }

    /// <summary>
    /// Unsubscribes a synchronous event handler from the event.
    /// </summary>
    /// <param name="eventHandler">The synchronous event handler to unsubscribe.</param>
    public void Unsubscribe(Action<T> eventHandler)
    {
        if (_subscribers.Contains(eventHandler))
        {
            _subscribers.Remove(eventHandler);
        }
    }

    /// <summary>
    /// Unsubscribes an asynchronous event handler from the event.
    /// </summary>
    /// <param name="eventHandler">The asynchronous event handler to unsubscribe.</param>
    public void Unsubscribe(Func<T, Task> eventHandler)
    {
        if (_subscribersAsync.Contains(eventHandler))
        {
            _subscribersAsync.Remove(eventHandler);
        }
    }

    /// <summary>
    /// Unsubscribes all event handlers from the event.
    /// </summary>
    public void UnsubscribeAll()
    {
        _subscribers.Clear();
        _subscribersAsync.Clear();
    }

    /// <summary>
    /// Disposes of the event by unsubscribing all event handlers.
    /// </summary>
    public void Dispose() => UnsubscribeAll();
}
