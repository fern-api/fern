<?php

namespace Seed\Core\Client;

use Psr\Http\Message\ResponseInterface;

/**
 * Iterates a streaming text response body, yielding one raw string per line.
 *
 * @extends Stream<string>
 */
class TextStream extends Stream
{
    public function __construct(ResponseInterface $response)
    {
        parent::__construct(
            response: $response,
            deserializer: fn (string $line): string => $line,
            format: StreamFormat::Text,
            terminator: null,
        );
    }
}
