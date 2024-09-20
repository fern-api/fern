<?php

namespace Seed\Dummy\Requests;

use Seed\Core\JsonProperty;

class Generateequest
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
