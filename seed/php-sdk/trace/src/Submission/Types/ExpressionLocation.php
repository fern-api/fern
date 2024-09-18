<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ExpressionLocation extends SerializableType
{
    #[JsonProperty("start")]
    /**
     * @var int $start
     */
    public int $start;

    #[JsonProperty("offset")]
    /**
     * @var int $offset
     */
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
