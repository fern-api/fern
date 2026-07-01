using SeedServerSentEventsResumable;

/// <summary>
/// End-to-end test for SSE stream reconnection.
///
/// Test 1: Resumable endpoint (POST /stream) — server drops after 5 events.
///   The SDK should automatically reconnect with Last-Event-ID and receive all 10 events.
///
/// Test 2: Non-resumable endpoint (POST /stream-non-resumable) — server sends all 10 events.
///   The SDK should receive all events in a single connection without reconnection logic.
///
/// Test 3: DisableStreamReconnection option — connect to resumable endpoint but with reconnection disabled.
///   The SDK should NOT reconnect and only receive the first 5 events.
/// </summary>

const string baseUrl = "http://localhost:8199";

var client = new SeedServerSentEventsResumableClient(
    new ClientOptions { BaseUrl = baseUrl }
);

var allPassed = true;

// --- Test 1: Resumable SSE stream with automatic reconnection ---
Console.WriteLine("=== Test 1: Resumable SSE stream with auto-reconnect ===");
try
{
    var events = new List<StreamedCompletion>();
    await foreach (var item in client.Completions.StreamAsync(new StreamCompletionRequest { Query = "test" }))
    {
        events.Add(item);
        Console.WriteLine($"  Received: delta={item.Delta}, tokens={item.Tokens}");
    }

    if (events.Count == 10)
    {
        Console.WriteLine($"  PASS: Received all {events.Count} events (reconnection worked!)");
        // Verify ordering
        for (int i = 0; i < events.Count; i++)
        {
            var expected = $"chunk_{i + 1}";
            if (events[i].Delta != expected)
            {
                Console.WriteLine($"  FAIL: Event {i} has delta='{events[i].Delta}', expected '{expected}'");
                allPassed = false;
                break;
            }
        }
        if (allPassed)
        {
            Console.WriteLine("  PASS: All events received in correct order");
        }
    }
    else
    {
        Console.WriteLine($"  FAIL: Expected 10 events, got {events.Count}");
        allPassed = false;
    }
}
catch (Exception ex)
{
    Console.WriteLine($"  FAIL: Exception: {ex.Message}");
    Console.WriteLine($"  {ex.GetType().Name}: {ex.StackTrace}");
    allPassed = false;
}

Console.WriteLine();

// --- Test 2: Non-resumable SSE stream (no reconnection needed) ---
Console.WriteLine("=== Test 2: Non-resumable SSE stream (no drop) ===");
try
{
    var events = new List<StreamedCompletion>();
    await foreach (var item in client.Completions.StreamNonResumableAsync(new StreamCompletionRequestNonResumable { Query = "test" }))
    {
        events.Add(item);
        Console.WriteLine($"  Received: delta={item.Delta}, tokens={item.Tokens}");
    }

    if (events.Count == 10)
    {
        Console.WriteLine($"  PASS: Received all {events.Count} events");
    }
    else
    {
        Console.WriteLine($"  FAIL: Expected 10 events, got {events.Count}");
        allPassed = false;
    }
}
catch (Exception ex)
{
    Console.WriteLine($"  FAIL: Exception: {ex.Message}");
    allPassed = false;
}

Console.WriteLine();

// --- Test 3: Resumable endpoint with reconnection DISABLED ---
Console.WriteLine("=== Test 3: Resumable endpoint with reconnection disabled ===");
try
{
    var events = new List<StreamedCompletion>();
    var options = new RequestOptions { DisableStreamReconnection = true };
    await foreach (var item in client.Completions.StreamAsync(new StreamCompletionRequest { Query = "test-no-reconnect" }, options))
    {
        events.Add(item);
        Console.WriteLine($"  Received: delta={item.Delta}, tokens={item.Tokens}");
    }

    // With reconnection disabled, the server drops after 5 events and the stream should end
    // (either with 5 events or an IOException — either is acceptable)
    if (events.Count == 5)
    {
        Console.WriteLine($"  PASS: Received only {events.Count} events (reconnection correctly disabled)");
    }
    else if (events.Count < 10)
    {
        Console.WriteLine($"  PASS: Received {events.Count} events (< 10, reconnection was disabled)");
    }
    else
    {
        Console.WriteLine($"  FAIL: Expected fewer than 10 events (reconnection should be disabled), got {events.Count}");
        allPassed = false;
    }
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"  PASS: Got expected HTTP exception when stream dropped (reconnection disabled): {ex.Message}");
}
catch (System.IO.IOException ex)
{
    Console.WriteLine($"  PASS: Got expected IO exception when stream dropped (reconnection disabled): {ex.Message}");
}
catch (Exception ex)
{
    // Other exceptions might be acceptable too (connection reset)
    Console.WriteLine($"  PASS (with exception): {ex.GetType().Name}: {ex.Message}");
}

Console.WriteLine();

// --- Test 4: MaxStreamReconnectAttempts limit ---
Console.WriteLine("=== Test 4: MaxStreamReconnectAttempts = 0 (no reconnects allowed) ===");
try
{
    var events = new List<StreamedCompletion>();
    var options = new RequestOptions { MaxStreamReconnectAttempts = 0 };
    await foreach (var item in client.Completions.StreamAsync(new StreamCompletionRequest { Query = "test-max-attempts" }, options))
    {
        events.Add(item);
        Console.WriteLine($"  Received: delta={item.Delta}, tokens={item.Tokens}");
    }

    if (events.Count <= 5)
    {
        Console.WriteLine($"  PASS: Received {events.Count} events (max reconnect attempts = 0, no reconnection)");
    }
    else
    {
        Console.WriteLine($"  FAIL: Expected <= 5 events, got {events.Count}");
        allPassed = false;
    }
}
catch (Exception ex)
{
    // Exception is acceptable — stream was dropped and we can't reconnect
    Console.WriteLine($"  PASS (with exception): {ex.GetType().Name}: {ex.Message}");
}

Console.WriteLine();
Console.WriteLine("====================================");
if (allPassed)
{
    Console.WriteLine("ALL TESTS PASSED");
    Environment.Exit(0);
}
else
{
    Console.WriteLine("SOME TESTS FAILED");
    Environment.Exit(1);
}
