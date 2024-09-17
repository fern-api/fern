<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Usage extends SerializableType
{
    #[JsonProperty("units")]
    /**
     * @var ?int $units
     */
    public ?int $units;

    /**
     * @param ?int $units
     */
    public function __construct(
        ?int $units = null,
    ) {
        $this->units = $units;
    }
}
