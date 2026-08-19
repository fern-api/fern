using NUnit.Framework;
using <%= namespace%>.Core.WebSockets;

namespace <%= testNamespace%>.Core.WebSockets;

[TestFixture]
public class EventTests
{
    [Test]
    public async Task RaiseEvent_SyncSubscriber_IsInvoked()
    {
        using var evt = new Event<string>();
        string? received = null;
        evt.Subscribe(s => received = s);

        await evt.RaiseEvent("hello");

        Assert.That(received, Is.EqualTo("hello"));
    }

    [Test]
    public async Task RaiseEvent_AsyncSubscriber_IsInvoked()
    {
        using var evt = new Event<string>();
        string? received = null;
        evt.Subscribe(async s =>
        {
            await Task.Delay(1);
            received = s;
        });

        await evt.RaiseEvent("async-hello");

        Assert.That(received, Is.EqualTo("async-hello"));
    }

    [Test]
    public async Task RaiseEvent_MultipleSubscribers_AllInvoked()
    {
        using var evt = new Event<int>();
        var results = new List<int>();
        evt.Subscribe(i => results.Add(i * 10));
        evt.Subscribe(i => results.Add(i * 20));
        evt.Subscribe(async i =>
        {
            await Task.Yield();
            results.Add(i * 30);
        });

        await evt.RaiseEvent(1);

        Assert.That(results, Is.EquivalentTo(new[] { 10, 20, 30 }));
    }

    [Test]
    public async Task Unsubscribe_SyncHandler_NoLongerInvoked()
    {
        using var evt = new Event<string>();
        var callCount = 0;
        Action<string> handler = _ => callCount++;
        evt.Subscribe(handler);

        await evt.RaiseEvent("first");
        Assert.That(callCount, Is.EqualTo(1));

        evt.Unsubscribe(handler);
        await evt.RaiseEvent("second");
        Assert.That(callCount, Is.EqualTo(1));
    }

    [Test]
    public async Task Unsubscribe_AsyncHandler_NoLongerInvoked()
    {
        using var evt = new Event<string>();
        var callCount = 0;
        Func<string, Task> handler = async _ =>
        {
            await Task.Yield();
            callCount++;
        };
        evt.Subscribe(handler);

        await evt.RaiseEvent("first");
        Assert.That(callCount, Is.EqualTo(1));

        evt.Unsubscribe(handler);
        await evt.RaiseEvent("second");
        Assert.That(callCount, Is.EqualTo(1));
    }

    [Test]
    public async Task UnsubscribeAll_ClearsAllHandlers()
    {
        using var evt = new Event<int>();
        var syncCount = 0;
        var asyncCount = 0;
        evt.Subscribe(_ => syncCount++);
        evt.Subscribe(async _ =>
        {
            await Task.Yield();
            asyncCount++;
        });

        await evt.RaiseEvent(1);
        Assert.That(syncCount, Is.EqualTo(1));
        Assert.That(asyncCount, Is.EqualTo(1));

        evt.UnsubscribeAll();
        await evt.RaiseEvent(2);
        Assert.That(syncCount, Is.EqualTo(1));
        Assert.That(asyncCount, Is.EqualTo(1));
    }

    [Test]
    public async Task Dispose_ClearsAllHandlers()
    {
        var evt = new Event<int>();
        var count = 0;
        evt.Subscribe(_ => count++);

        await evt.RaiseEvent(1);
        Assert.That(count, Is.EqualTo(1));

        evt.Dispose();
        await evt.RaiseEvent(2);
        Assert.That(count, Is.EqualTo(1));
    }

    [Test]
    public async Task RaiseEvent_NoSubscribers_DoesNotThrow()
    {
        using var evt = new Event<string>();
        Assert.DoesNotThrowAsync(async () => await evt.RaiseEvent("nobody listening"));
    }

    [Test]
    public async Task ConcurrentSubscribeAndRaise_DoesNotThrow()
    {
        using var evt = new Event<int>();
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        var raiseCount = 0;

        // Start raising events on one thread
        var raiser = Task.Run(async () =>
        {
            while (!cts.Token.IsCancellationRequested)
            {
                await evt.RaiseEvent(Interlocked.Increment(ref raiseCount));
                await Task.Delay(1);
            }
        });

        // Concurrently subscribe/unsubscribe on another thread
        var subscriber = Task.Run(async () =>
        {
            while (!cts.Token.IsCancellationRequested)
            {
                Action<int> handler = _ => { };
                evt.Subscribe(handler);
                await Task.Delay(1);
                evt.Unsubscribe(handler);
            }
        });

        // If we survive 2 seconds without exception, thread safety is OK
        await Task.Delay(2000);
        cts.Cancel();

        Assert.DoesNotThrowAsync(async () =>
        {
            await raiser;
            await subscriber;
        });
        Assert.That(raiseCount, Is.GreaterThan(0));
    }

    [Test]
    public async Task RaiseEvent_WithComplexType_PassesCorrectData()
    {
        using var evt = new Event<Closed>();
        Closed? received = null;
        evt.Subscribe(c => received = c);

        var closed = new Closed { Code = 1000, Reason = "Normal" };
        await evt.RaiseEvent(closed);

        Assert.That(received, Is.Not.Null);
        Assert.That(received!.Code, Is.EqualTo(1000));
        Assert.That(received.Reason, Is.EqualTo("Normal"));
    }

    [Test]
    public async Task Subscribe_SameHandlerTwice_OnlyInvokedOnce()
    {
        using var evt = new Event<int>();
        var count = 0;
        Action<int> handler = _ => count++;
        evt.Subscribe(handler);
        evt.Subscribe(handler); // HashSet deduplicates

        await evt.RaiseEvent(1);

        Assert.That(count, Is.EqualTo(1));
    }
}
