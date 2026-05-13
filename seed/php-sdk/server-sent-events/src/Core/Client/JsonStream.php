<?php

namespace Seed\Core\Client;

use Closure;
use Psr\Http\Message\ResponseInterface;

/**
 * Iterates a newline-delimited JSON (NDJSON) response body, yielding one
 * deserialized chunk per non-empty line.
 *
 * @template T
 * @extends Stream<T>
 */
class JsonStream extends Stream
{
    /**
     * @param ResponseInterface $response The HTTP response to stream from.
     * @param Closure(string): T $deserializer Called once per line with the raw
     *   JSON payload string.
     * @param ?string $terminator Optional sentinel line that ends the stream
     *   when received. Pass `null` to read until EOF.
     */
    public function __construct(
        ResponseInterface $response,
        Closure $deserializer,
        ?string $terminator = null,
    ) {
        parent::__construct(
            response: $response,
            deserializer: $deserializer,
            format: StreamFormat::Json,
            terminator: $terminator,
        );
    }
}
