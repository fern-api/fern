// ReSharper disable All
#pragma warning disable
namespace SeedWebsocketMultiUrl.Core.WebSockets;

/// <summary>
/// Configures the backoff strategy for automatic reconnection.
/// </summary>
public class ReconnectStrategy
{
    private readonly Random _jitterRandom = new();

    private int _attemptsMade;
    private TimeSpan _currentInterval;

    /// <summary>
    /// Gets the number of reconnection attempts made since the last reset.
    /// </summary>
    public int AttemptsMade => _attemptsMade;

    /// <summary>
    /// Initial delay before the first reconnection attempt.
    /// Default: 1 second.
    /// </summary>
    public TimeSpan MinReconnectInterval { get; set; } = TimeSpan.FromSeconds(1);

    /// <summary>
    /// Maximum delay between reconnection attempts.
    /// Default: 60 seconds.
    /// </summary>
    public TimeSpan MaxReconnectInterval { get; set; } = TimeSpan.FromSeconds(60);

    /// <summary>
    /// Maximum number of reconnection attempts before giving up.
    /// Set to null for unlimited attempts. Default: null.
    /// </summary>
    public int? MaxAttempts { get; set; }

    /// <summary>
    /// Add random jitter (0-25% of interval) to prevent thundering herd.
    /// Default: true.
    /// </summary>
    public bool UseJitter { get; set; } = true;

    /// <summary>
    /// Get the next reconnection delay and increment the attempt counter.
    /// Returns null if max attempts have been exhausted.
    /// </summary>
    public TimeSpan? GetNextDelay()
    {
        if (MaxAttempts.HasValue && _attemptsMade >= MaxAttempts.Value)
        {
            return null; // exhausted
        }

        if (_attemptsMade == 0)
        {
            _currentInterval = MinReconnectInterval;
        }
        else
        {
            // Exponential backoff: double the interval, capped at max
            _currentInterval = TimeSpan.FromMilliseconds(
                Math.Min(
                    _currentInterval.TotalMilliseconds * 2,
                    MaxReconnectInterval.TotalMilliseconds
                )
            );
        }

        _attemptsMade++;

        if (UseJitter)
        {
            // Add 0-25% random jitter
            var jitterMs = _currentInterval.TotalMilliseconds * 0.25 * _jitterRandom.NextDouble();
            return _currentInterval + TimeSpan.FromMilliseconds(jitterMs);
        }

        return _currentInterval;
    }

    /// <summary>
    /// Reset the attempt counter and interval. Call after successful connection.
    /// </summary>
    public void Reset()
    {
        _attemptsMade = 0;
        _currentInterval = MinReconnectInterval;
    }
}
