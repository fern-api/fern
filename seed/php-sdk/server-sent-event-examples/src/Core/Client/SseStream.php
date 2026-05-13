<?php

namespace Seed\Core\Client;

use Closure;
use Generator;
use Psr\Http\Message\ResponseInterface;
use RuntimeException;

/**
 * Iterates a `text/event-stream` (SSE) response body, yielding one deserialized
 * event per dispatched frame.
 *
 * @template T
 * @extends Stream<T>
 */
class SseStream extends Stream
{
    /**
     * @param ResponseInterface $response The HTTP response to stream from.
     * @param Closure(string): T $deserializer Called once per dispatched event
     *   with the raw `data:` payload string (newline-joined for multi-line frames).
     * @param ?string $terminator Optional sentinel payload that ends the stream
     *   when received. Defaults to '[DONE]', a common SSE convention.
     *   Pass `null` to disable terminator handling.
     * @param int $maxBufferSize See `Stream::__construct`. Defaults to 1 MiB.
     */
    public function __construct(
        ResponseInterface $response,
        Closure $deserializer,
        ?string $terminator = '[DONE]',
        int $maxBufferSize = self::DEFAULT_MAX_BUFFER_SIZE,
    ) {
        self::validateContentType($response);
        parent::__construct(
            response: $response,
            deserializer: $deserializer,
            format: StreamFormat::Sse,
            terminator: $terminator,
            maxBufferSize: $maxBufferSize,
        );
    }

    /**
     * Iterates the stream yielding both the deserialized payload and the
     * accompanying SSE metadata (event type, id, retry). Use this when you
     * need the event field (e.g. for event-typed unions) or `Last-Event-ID`
     * for resumption logic.
     *
     * For data-only iteration, use this object directly as an iterable:
     * `foreach ($stream as $event) { ... }`.
     *
     * @return Generator<int, SseEvent<T>>
     */
    public function events(): Generator
    {
        foreach ($this->iterateRawSseEvents() as $raw) {
            yield new SseEvent(
                data: ($this->deserializer)($raw['data']),
                event: $raw['event'],
                id: $raw['id'],
                retry: $raw['retry'],
            );
        }
    }

    /**
     * Validates that the response's Content-Type matches an SSE stream.
     *
     * Per WHATWG, the SSE wire format is always UTF-8; we reject explicit
     * non-UTF-8 charset parameters rather than risk silent mojibake. A missing
     * Content-Type header is tolerated — some servers omit it on streaming
     * responses — but a wrong media type or wrong charset always throws.
     */
    private static function validateContentType(ResponseInterface $response): void
    {
        $contentType = $response->getHeaderLine('Content-Type');
        if ($contentType === '') {
            return;
        }
        $parts = explode(';', $contentType);
        $mediaType = strtolower(trim($parts[0]));
        if ($mediaType !== 'text/event-stream') {
            throw new RuntimeException(
                "Expected Content-Type 'text/event-stream' for SSE response, got '{$mediaType}'",
            );
        }
        foreach (array_slice($parts, 1) as $param) {
            $param = trim($param);
            if (stripos($param, 'charset=') !== 0) {
                continue;
            }
            $charset = strtolower(trim(substr($param, 8), " \"'"));
            if ($charset !== '' && $charset !== 'utf-8' && $charset !== 'utf8') {
                throw new RuntimeException(
                    "Unsupported SSE charset '{$charset}'; per the WHATWG spec only UTF-8 is permitted",
                );
            }
        }
    }
}
