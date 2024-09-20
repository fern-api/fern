<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ExpressionLocation extends SerializableType
{
    /**
     * @var int $start
     */
    #[JsonProperty('start')]
    public int $start;

    /**
     * @var int $offset
     */
    #[JsonProperty('offset')]
    public int $offset;

    /**
     * @param array{
     *   start: int,
     *   offset: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->start = $values['start'];
        $this->offset = $values['offset'];
    }
}
