<?php

namespace Seed\Core\Client;

use Closure;
use Generator;
use IteratorAggregate;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;

enum StreamFormat: string
{
    case Sse = 'sse';
    case Json = 'json';
    case Text = 'text';
}

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
 * @template T
 * @implements IteratorAggregate<int, T>
 */
class Stream implements IteratorAggregate
{
    private const READ_CHUNK_SIZE = 8192;

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
     */
    public function __construct(
        ResponseInterface $response,
        Closure $deserializer,
        private readonly StreamFormat $format = StreamFormat::Sse,
        private readonly ?string $terminator = null,
    ) {
        $this->body = $response->getBody();
        $this->deserializer = $deserializer;
    }

    /**
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
     * WHATWG-compliant SSE frame parser.
     *
     * @return Generator<int, T>
     */
    private function iterateSse(): Generator
    {
        $dataBuffer = '';
        foreach ($this->readLines() as $line) {
            if ($line === '') {
                // Blank line dispatches the accumulated event.
                if ($dataBuffer === '') {
                    continue;
                }
                // Strip the single trailing "\n" added by the field append step.
                $payload = substr($dataBuffer, 0, -1);
                $dataBuffer = '';
                if ($this->terminator !== null && $payload === $this->terminator) {
                    return;
                }
                yield ($this->deserializer)($payload);
                continue;
            }
            if (str_starts_with($line, ':')) {
                // SSE comment — ignored per spec.
                continue;
            }
            $colonPos = strpos($line, ':');
            if ($colonPos === false) {
                // Line is a field name with empty value; only `data` is meaningful for us.
                if ($line === 'data') {
                    $dataBuffer .= "\n";
                }
                continue;
            }
            $field = substr($line, 0, $colonPos);
            $value = substr($line, $colonPos + 1);
            if (str_starts_with($value, ' ')) {
                $value = substr($value, 1);
            }
            // Only `data` is yielded; `event`/`id`/`retry` are accepted but unused here.
            if ($field === 'data') {
                $dataBuffer .= $value . "\n";
            }
        }
        // Stream ended mid-event (no terminating blank line). Dispatch whatever we have.
        if ($dataBuffer !== '') {
            $payload = substr($dataBuffer, 0, -1);
            if ($this->terminator === null || $payload !== $this->terminator) {
                yield ($this->deserializer)($payload);
            }
        }
    }

    /**
     * Newline-delimited frames (NDJSON, line-by-line).
     *
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
     * Raw newline-delimited text frames.
     *
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
     * to LF per the WHATWG SSE spec. Trailing partial content (without a
     * terminating newline) is emitted as a final line.
     *
     * @return Generator<int, string>
     */
    private function readLines(): Generator
    {
        $buffer = '';
        $pendingCr = false;
        while (!$this->body->eof()) {
            $chunk = $this->body->read(self::READ_CHUNK_SIZE);
            if ($chunk === '') {
                continue;
            }
            // If the previous chunk ended on "\r", swallow a leading "\n" so we don't
            // emit a spurious blank line for a "\r\n" sequence split across chunks.
            if ($pendingCr && $chunk[0] === "\n") {
                $chunk = substr($chunk, 1);
            }
            $pendingCr = str_ends_with($chunk, "\r");
            // Normalize line endings on just this chunk: "\r\n" and lone "\r" -> "\n".
            $chunk = str_replace(["\r\n", "\r"], "\n", $chunk);
            $buffer .= $chunk;
            while (($lfPos = strpos($buffer, "\n")) !== false) {
                yield substr($buffer, 0, $lfPos);
                $buffer = substr($buffer, $lfPos + 1);
            }
        }
        if ($buffer !== '') {
            yield $buffer;
        }
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
