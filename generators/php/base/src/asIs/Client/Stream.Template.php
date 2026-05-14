<?php

namespace <%= namespace%>;

use Closure;
use Generator;
use IteratorAggregate;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;
use RuntimeException;

/**
 * Iterates a streaming HTTP response body frame-by-frame.
 *
 * Parameterized by `$format`, which selects the framing strategy:
 *   - 'sse'  — WHATWG Server-Sent Events: lines starting with `data:` (and
 *              optionally `event:`, `id:`, `retry:`); a blank line dispatches
 *              the accumulated event. Multi-line `data` fields are joined
 *              with newlines.
 *   - 'json' — newline-delimited JSON: each non-empty line is one frame.
 *   - 'text' — newline-delimited text: each line is yielded as a raw string.
 *
 * When `$terminator` is set, an event whose payload equals the terminator
 * ends iteration cleanly (e.g. `[DONE]` for SSE).
 *
 * A `$maxBufferSize` cap (default 1 MiB) guards against malformed streams that
 * never emit a frame boundary: if the line buffer or a single event's data
 * exceeds the cap, iteration aborts with `RuntimeException`. The cap is
 * enforced *before* allocation, not after — a hostile stream cannot drive us
 * past the limit and then trip the check.
 *
 * Direct instantiation of `Stream` is not supported; use `SseStream`,
 * `JsonStream`, or `TextStream` instead. The constructor is `protected` to
 * enforce this.
 *
 * @template T
 * @implements IteratorAggregate<int, T>
 */
class Stream implements IteratorAggregate
{
    public const DEFAULT_MAX_BUFFER_SIZE = 1_048_576;

    private const READ_CHUNK_SIZE = 8192;
    private const UTF8_BOM = "\xEF\xBB\xBF";

    private StreamInterface $body;

    /** @var Closure(string): T */
    private Closure $deserializer;

    /**
     * @param ResponseInterface $response The HTTP response to stream from.
     * @param Closure(string): T $deserializer Called once per frame with the raw payload string.
     *   For text streams, the deserializer is typically `fn(string $line) => $line`.
     * @param StreamFormat $format Framing strategy for the stream.
     * @param ?string $terminator Optional sentinel value that ends the stream when matched
     *   against the raw frame payload (e.g. '[DONE]').
     * @param int $maxBufferSize Maximum size in bytes for the line buffer or a single SSE
     *   event's accumulated `data` field. Exceeding this throws `RuntimeException` to
     *   guard against pathological streams. Defaults to 1 MiB.
     */
    protected function __construct(
        ResponseInterface $response,
        Closure $deserializer,
        private readonly StreamFormat $format = StreamFormat::Sse,
        private readonly ?string $terminator = null,
        private readonly int $maxBufferSize = self::DEFAULT_MAX_BUFFER_SIZE,
    ) {
        $this->body = $response->getBody();
        $this->deserializer = $deserializer;
    }

    /**
     * Iteration is one-shot: PSR-7 bodies are forward-only, so re-iterating the
     * same `Stream` instance yields nothing useful.
     *
     * @return Generator<int, T>
     */
    public function getIterator(): Generator
    {
        return match ($this->format) {
            StreamFormat::Sse => $this->iterateSse(),
            StreamFormat::Json => $this->iterateDelimited(),
            StreamFormat::Text => $this->iterateText(),
        };
    }

    /**
     * Applies the configured deserializer to a single raw frame payload.
     * Available to subclasses (notably `SseStream::events()`) so they can
     * construct typed envelopes without accessing the closure directly.
     *
     * @return T
     */
    protected function deserialize(string $raw): mixed
    {
        return ($this->deserializer)($raw);
    }

    /**
     * @return Generator<int, T>
     */
    private function iterateSse(): Generator
    {
        foreach ($this->iterateRawSseEvents() as $raw) {
            yield ($this->deserializer)($raw['data']);
        }
    }

    /**
     * Iterates the SSE stream yielding raw envelopes with WHATWG metadata fields
     * intact. Yields plain associative arrays — not `SseEvent` objects — so the
     * data-only iteration path doesn't pay the allocation cost; `SseStream::events()`
     * constructs the public `SseEvent<T>` on top.
     *
     * Per WHATWG: the `id:` field persists across events within this iteration;
     * the configured `terminator`, if present, ends iteration when matched against
     * `data`.
     *
     * @internal
     * @return Generator<int, array{data: string, event: string, id: string, retry: ?int}>
     */
    protected function iterateRawSseEvents(): Generator
    {
        $dataBuffer = '';
        $eventType = '';
        $lastEventId = '';
        $retry = null;
        foreach ($this->readLines() as $line) {
            if ($line === '') {
                if ($dataBuffer === '') {
                    continue;
                }
                // Strip the single trailing "\n" added by the field-append step.
                $payload = substr($dataBuffer, 0, -1);
                $dataBuffer = '';
                if ($this->terminator !== null && $payload === $this->terminator) {
                    return;
                }
                yield ['data' => $payload, 'event' => $eventType, 'id' => $lastEventId, 'retry' => $retry];
                // Per WHATWG: do NOT reset lastEventId between events.
                $eventType = '';
                $retry = null;
                continue;
            }
            if (str_starts_with($line, ':')) {
                continue;
            }
            $colonPos = strpos($line, ':');
            if ($colonPos === false) {
                if ($line === 'data') {
                    $dataBuffer = $this->appendWithinCap($dataBuffer, "\n");
                }
                continue;
            }
            $field = substr($line, 0, $colonPos);
            $value = substr($line, $colonPos + 1);
            if (str_starts_with($value, ' ')) {
                $value = substr($value, 1);
            }
            switch ($field) {
                case 'data':
                    // Enforce the cap before allocation: a hostile stream emitting
                    // many `data:` lines without a dispatching blank line cannot
                    // drive us past the limit and then trip the check.
                    $dataBuffer = $this->appendWithinCap($dataBuffer, $value . "\n");
                    break;
                case 'event':
                    $eventType = $value;
                    break;
                case 'id':
                    // WHATWG: ignore IDs that contain a NULL byte.
                    if (!str_contains($value, "\0")) {
                        $lastEventId = $value;
                    }
                    break;
                case 'retry':
                    // WHATWG: ignore the value if it isn't a base-10 integer.
                    if ($value !== '' && ctype_digit($value)) {
                        $retry = (int) $value;
                    }
                    break;
            }
        }
        // Stream ended mid-event (no terminating blank line). Dispatch whatever we have.
        if ($dataBuffer !== '') {
            $payload = substr($dataBuffer, 0, -1);
            if ($this->terminator === null || $payload !== $this->terminator) {
                yield ['data' => $payload, 'event' => $eventType, 'id' => $lastEventId, 'retry' => $retry];
            }
        }
    }

    /**
     * @return Generator<int, T>
     */
    private function iterateDelimited(): Generator
    {
        foreach ($this->readLines() as $line) {
            if ($line === '') {
                continue;
            }
            if ($this->terminator !== null && $line === $this->terminator) {
                return;
            }
            yield ($this->deserializer)($line);
        }
    }

    /**
     * @return Generator<int, T>
     */
    private function iterateText(): Generator
    {
        foreach ($this->readLines() as $line) {
            yield ($this->deserializer)($line);
        }
    }

    /**
     * Reads the response body and yields complete lines, normalizing CRLF/CR
     * to LF per the WHATWG SSE spec. Strips a single UTF-8 BOM if present at
     * the start of the stream (WHATWG §9.2.4). Trailing partial content
     * (without a terminating newline) is emitted as a final line.
     *
     * `$pendingCr` tracks whether the prior chunk's last byte was `\r`, so a
     * `\r\n` sequence split across a read boundary collapses to one terminator
     * instead of two.
     *
     * @return Generator<int, string>
     */
    private function readLines(): Generator
    {
        $buffer = '';
        $pendingCr = false;
        $bomChecked = false;
        while (!$this->body->eof()) {
            $chunk = $this->body->read(self::READ_CHUNK_SIZE);
            if ($chunk === '') {
                continue;
            }
            if ($pendingCr && $chunk[0] === "\n") {
                $chunk = substr($chunk, 1);
            }
            $pendingCr = str_ends_with($chunk, "\r");
            $chunk = str_replace(["\r\n", "\r"], "\n", $chunk);
            $buffer = $this->appendWithinCap($buffer, $chunk);
            if (!$bomChecked && strlen($buffer) >= 3) {
                $bomChecked = true;
                if (str_starts_with($buffer, self::UTF8_BOM)) {
                    $buffer = substr($buffer, 3);
                }
            }
            while (($lfPos = strpos($buffer, "\n")) !== false) {
                yield substr($buffer, 0, $lfPos);
                $buffer = substr($buffer, $lfPos + 1);
            }
        }
        // BOM may not have been checked yet if the entire body was < 3 bytes.
        if (!$bomChecked && str_starts_with($buffer, self::UTF8_BOM)) {
            $buffer = substr($buffer, 3);
        }
        if ($buffer !== '') {
            yield $buffer;
        }
    }

    /**
     * Appends $suffix to $buffer, throwing `RuntimeException` if the result
     * would exceed `maxBufferSize`. The cap is enforced before the
     * concatenation allocates, so a runaway stream is bounded by the configured
     * limit rather than by available memory.
     */
    private function appendWithinCap(string $buffer, string $suffix): string
    {
        if (strlen($buffer) + strlen($suffix) > $this->maxBufferSize) {
            throw new RuntimeException(
                "Stream buffer would exceed maximum size of {$this->maxBufferSize} bytes",
            );
        }
        return $buffer . $suffix;
    }

    public function __destruct()
    {
        try {
            $this->body->close();
        } catch (\Throwable) {
            // Best effort — the body may already be closed by the consumer.
        }
    }
}
