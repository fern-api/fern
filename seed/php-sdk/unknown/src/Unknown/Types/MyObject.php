<?php

namespace Seed\Unknown\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class MyObject extends JsonSerializableType
{
    /**
     * @var mixed $unknown
     */
    #[JsonProperty('unknown')]
    public mixed $unknown;

    /**
     * @param array{
     *   unknown: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->unknown = $values['unknown'];
    }
}
