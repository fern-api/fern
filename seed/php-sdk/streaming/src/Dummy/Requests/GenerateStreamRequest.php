<?php

namespace Seed\Dummy\Requests;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class GenerateStreamRequest extends SerializableType
{
    /**
     * @var bool $stream
     */
    #[JsonProperty('stream')]
    public bool $stream;

    /**
     * @var int $numEvents
     */
    #[JsonProperty('num_events')]
    public int $numEvents;

    /**
     * @param array{
     *   stream: bool,
     *   numEvents: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->stream = $values['stream'];
        $this->numEvents = $values['numEvents'];
    }
}
