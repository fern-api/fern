<?php

namespace Seed\Dummy\Requests;

use Seed\Core\JsonProperty;

class GenerateStreamRequest
{
    /**
     * @var bool $stream
     */
    #[JsonProperty("stream")]
    public bool $stream;

    /**
     * @var int $numEvents
     */
    #[JsonProperty("num_events")]
    public int $numEvents;

}
