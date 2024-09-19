<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ExpressionLocation extends SerializableType
{
    /**
     * @var int $start
     */
    #[JsonProperty("start")]
    public int $start;

    /**
     * @var int $offset
     */
    #[JsonProperty("offset")]
    public int $offset;

    /**
     * @param int $start
     * @param int $offset
     */
    public function __construct(
        int $start,
        int $offset,
    ) {
        $this->start = $start;
        $this->offset = $offset;
    }
}
