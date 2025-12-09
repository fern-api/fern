<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ExpressionLocation extends JsonSerializableType
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
    )
    {
        $this->start = $values['start'];$this->offset = $values['offset'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
