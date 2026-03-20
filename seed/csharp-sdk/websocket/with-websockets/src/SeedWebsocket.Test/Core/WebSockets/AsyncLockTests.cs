using NUnit.Framework;
using SeedWebsocket.Core.WebSockets;

namespace SeedWebsocket.Test.Core.WebSockets;

[TestFixture]
public class AsyncLockTests
{
    [Test]
    public async Task LockAsync_ProvidesMutualExclusion()
    {
        var asyncLock = new AsyncLock();
        var counter = 0;
        var maxConcurrent = 0;
        var currentConcurrent = 0;
        var tasks = new List<Task>();

        for (int i = 0; i < 10; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                using (await asyncLock.LockAsync())
                {
                    var c = Interlocked.Increment(ref currentConcurrent);
                    if (c > maxConcurrent)
                        Interlocked.Exchange(ref maxConcurrent, c);

                    Interlocked.Increment(ref counter);
                    await Task.Delay(10); // Simulate work

                    Interlocked.Decrement(ref currentConcurrent);
                }
            }));
        }

        await Task.WhenAll(tasks);

        Assert.That(counter, Is.EqualTo(10));
        Assert.That(maxConcurrent, Is.EqualTo(1), "Only one task should hold the lock at a time");
    }

    [Test]
    public void Lock_ProvidesMutualExclusion()
    {
        var asyncLock = new AsyncLock();
        var counter = 0;
        var tasks = new List<Task>();

        for (int i = 0; i < 10; i++)
        {
            tasks.Add(Task.Run(() =>
            {
                using (asyncLock.Lock())
                {
                    counter++;
                    Thread.Sleep(5);
                }
            }));
        }

        Task.WhenAll(tasks).Wait();

        Assert.That(counter, Is.EqualTo(10));
    }

    [Test]
    public async Task LockAsync_IsReentrantSafe_SequentialAcquisition()
    {
        var asyncLock = new AsyncLock();
        var value = 0;

        using (await asyncLock.LockAsync())
        {
            value = 1;
        }

        using (await asyncLock.LockAsync())
        {
            value = 2;
        }

        Assert.That(value, Is.EqualTo(2));
    }

    [Test]
    public async Task LockAsync_ReleasesOnDispose()
    {
        var asyncLock = new AsyncLock();
        var enteredSecond = false;

        // Acquire and release the lock
        using (await asyncLock.LockAsync())
        {
            // Hold the lock briefly
        }

        // Should be able to acquire again immediately
        using (await asyncLock.LockAsync())
        {
            enteredSecond = true;
        }

        Assert.That(enteredSecond, Is.True);
    }

    [Test]
    public async Task LockAsync_BlocksUntilRelease()
    {
        var asyncLock = new AsyncLock();
        var orderLog = new List<int>();

        var firstAcquired = new TaskCompletionSource<bool>();
        var firstRelease = new TaskCompletionSource<bool>();

        var task1 = Task.Run(async () =>
        {
            using (await asyncLock.LockAsync())
            {
                orderLog.Add(1);
                firstAcquired.SetResult(true);
                await firstRelease.Task; // Hold the lock until signaled
            }
        });

        await firstAcquired.Task;

        var task2 = Task.Run(async () =>
        {
            // This should block until task1 releases
            using (await asyncLock.LockAsync())
            {
                orderLog.Add(2);
            }
        });

        // Give task2 a moment to start waiting
        await Task.Delay(50);

        // task2 shouldn't have entered the lock yet
        Assert.That(orderLog, Is.EqualTo(new[] { 1 }));

        // Release the lock in task1
        firstRelease.SetResult(true);
        await task1;
        await task2;

        Assert.That(orderLog, Is.EqualTo(new[] { 1, 2 }));
    }
}
