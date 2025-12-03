<?php

namespace Seed\Dummy\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Generateequest extends JsonSerializableType
{
    /**
     * @var false $stream
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
     *   stream: false,
     *   numEvents: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->stream = $values['stream'];$this->numEvents = $values['numEvents'];
    }
}
