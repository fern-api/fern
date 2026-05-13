<?php

namespace <%= namespace%>;

use Closure;
use Psr\Http\Message\ResponseInterface;

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
     */
    public function __construct(
        ResponseInterface $response,
        Closure $deserializer,
        ?string $terminator = '[DONE]',
    ) {
        parent::__construct(
            response: $response,
            deserializer: $deserializer,
            format: StreamFormat::Sse,
            terminator: $terminator,
        );
    }
}
