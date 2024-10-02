<?php

namespace Seed;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Usage extends SerializableType
{
    /**
     * @var ?int $units
     */
    #[JsonProperty('units')]
    public ?int $units;

    /**
     * @param array{
     *   units?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->units = $values['units'] ?? null;
    }
}
