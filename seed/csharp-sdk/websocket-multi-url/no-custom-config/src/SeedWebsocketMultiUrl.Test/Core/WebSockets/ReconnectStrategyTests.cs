using NUnit.Framework;
using SeedWebsocketMultiUrl.Core.WebSockets;

namespace SeedWebsocketMultiUrl.Test.Core.WebSockets;

[TestFixture]
public class ReconnectStrategyTests
{
    [Test]
    public void FirstDelay_ReturnsMinInterval()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromSeconds(1),
            MaxReconnectInterval = TimeSpan.FromSeconds(60),
            UseJitter = false,
        };

        var delay = strategy.GetNextDelay();

        Assert.That(delay, Is.Not.Null);
        Assert.That(delay!.Value, Is.EqualTo(TimeSpan.FromSeconds(1)));
        Assert.That(strategy.AttemptsMade, Is.EqualTo(1));
    }

    [Test]
    public void ExponentialBackoff_DoublesEachAttempt()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromSeconds(1),
            MaxReconnectInterval = TimeSpan.FromSeconds(60),
            UseJitter = false,
        };

        var d1 = strategy.GetNextDelay()!.Value; // 1s
        var d2 = strategy.GetNextDelay()!.Value; // 2s
        var d3 = strategy.GetNextDelay()!.Value; // 4s
        var d4 = strategy.GetNextDelay()!.Value; // 8s

        Assert.That(d1.TotalSeconds, Is.EqualTo(1));
        Assert.That(d2.TotalSeconds, Is.EqualTo(2));
        Assert.That(d3.TotalSeconds, Is.EqualTo(4));
        Assert.That(d4.TotalSeconds, Is.EqualTo(8));
    }

    [Test]
    public void BackoffCapsAtMax()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromSeconds(1),
            MaxReconnectInterval = TimeSpan.FromSeconds(5),
            UseJitter = false,
        };

        // 1, 2, 4, 5 (capped), 5 (capped)
        strategy.GetNextDelay(); // 1
        strategy.GetNextDelay(); // 2
        strategy.GetNextDelay(); // 4
        var d4 = strategy.GetNextDelay()!.Value; // min(8, 5) = 5
        var d5 = strategy.GetNextDelay()!.Value; // min(10, 5) = 5

        Assert.That(d4.TotalSeconds, Is.EqualTo(5));
        Assert.That(d5.TotalSeconds, Is.EqualTo(5));
    }

    [Test]
    public void MaxAttempts_ReturnsNullWhenExhausted()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromMilliseconds(100),
            MaxReconnectInterval = TimeSpan.FromSeconds(10),
            MaxAttempts = 3,
            UseJitter = false,
        };

        Assert.That(strategy.GetNextDelay(), Is.Not.Null); // attempt 1
        Assert.That(strategy.GetNextDelay(), Is.Not.Null); // attempt 2
        Assert.That(strategy.GetNextDelay(), Is.Not.Null); // attempt 3
        Assert.That(strategy.GetNextDelay(), Is.Null); // exhausted
        Assert.That(strategy.AttemptsMade, Is.EqualTo(3));
    }

    [Test]
    public void MaxAttempts_Zero_ImmediatelyExhausted()
    {
        var strategy = new ReconnectStrategy { MaxAttempts = 0 };

        Assert.That(strategy.GetNextDelay(), Is.Null);
    }

    [Test]
    public void Reset_ClearsAttempts()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromSeconds(1),
            MaxReconnectInterval = TimeSpan.FromSeconds(60),
            MaxAttempts = 2,
            UseJitter = false,
        };

        strategy.GetNextDelay(); // attempt 1
        strategy.GetNextDelay(); // attempt 2
        Assert.That(strategy.GetNextDelay(), Is.Null); // exhausted

        strategy.Reset();
        Assert.That(strategy.AttemptsMade, Is.EqualTo(0));

        var delay = strategy.GetNextDelay();
        Assert.That(delay, Is.Not.Null);
        Assert.That(delay!.Value, Is.EqualTo(TimeSpan.FromSeconds(1)));
    }

    [Test]
    public void Jitter_AddsRandomDelay()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromSeconds(10),
            MaxReconnectInterval = TimeSpan.FromSeconds(60),
            UseJitter = true,
        };

        var delay = strategy.GetNextDelay()!.Value;

        // With jitter, delay should be between 10s and 12.5s (10s + up to 25%)
        Assert.That(delay.TotalSeconds, Is.GreaterThanOrEqualTo(10));
        Assert.That(delay.TotalSeconds, Is.LessThanOrEqualTo(12.5));
    }

    [Test]
    public void Jitter_ProducesVariation()
    {
        // Run multiple times and verify we get at least some variation
        var delays = new HashSet<double>();
        for (int i = 0; i < 20; i++)
        {
            var strategy = new ReconnectStrategy
            {
                MinReconnectInterval = TimeSpan.FromSeconds(10),
                MaxReconnectInterval = TimeSpan.FromSeconds(60),
                UseJitter = true,
            };
            delays.Add(strategy.GetNextDelay()!.Value.TotalMilliseconds);
        }

        // With 20 samples, we should get more than 1 unique value
        Assert.That(delays.Count, Is.GreaterThan(1));
    }

    [Test]
    public void UnlimitedAttempts_NeverReturnsNull()
    {
        var strategy = new ReconnectStrategy
        {
            MinReconnectInterval = TimeSpan.FromMilliseconds(10),
            MaxReconnectInterval = TimeSpan.FromMilliseconds(100),
            MaxAttempts = null,
            UseJitter = false,
        };

        for (int i = 0; i < 100; i++)
        {
            Assert.That(strategy.GetNextDelay(), Is.Not.Null, $"Attempt {i + 1} returned null");
        }

        Assert.That(strategy.AttemptsMade, Is.EqualTo(100));
    }

    [Test]
    public void DefaultValues_AreCorrect()
    {
        var strategy = new ReconnectStrategy();

        Assert.That(strategy.MinReconnectInterval, Is.EqualTo(TimeSpan.FromSeconds(1)));
        Assert.That(strategy.MaxReconnectInterval, Is.EqualTo(TimeSpan.FromSeconds(60)));
        Assert.That(strategy.MaxAttempts, Is.Null);
        Assert.That(strategy.UseJitter, Is.True);
        Assert.That(strategy.AttemptsMade, Is.EqualTo(0));
    }
}
