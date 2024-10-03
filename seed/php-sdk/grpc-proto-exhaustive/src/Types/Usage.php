<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Usage extends JsonSerializableType
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
