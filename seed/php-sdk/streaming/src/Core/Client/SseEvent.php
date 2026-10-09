<?php

namespace Seed\Core\Client;

/**
 * A single Server-Sent Event with its WHATWG metadata fields.
 *
 * Returned by `SseStream::events()`. Use plain `foreach ($stream as $payload)` if
 * metadata isn't needed and you only want the deserialized `data` field.
 *
 * @template T
 */
final class SseEvent
{
    /**
     * @param T $data Deserialized payload from the `data:` field(s). Multi-line
     *   data is joined with a single newline before deserialization.
     * @param string $event Value of the `event:` field, or empty string if not set.
     * @param string $id Most recent `id:` field value. Per the WHATWG spec, this
     *   persists across events: a subsequent event without an explicit `id:`
     *   inherits the previous one. Empty string until the first id is observed.
     * @param ?int $retry Reconnection time in milliseconds from the `retry:` field,
     *   or null if not set or unparseable.
     */
    public function __construct(
        public readonly mixed $data,
        public readonly string $event = '',
        public readonly string $id = '',
        public readonly ?int $retry = null,
    ) {
    }
}
