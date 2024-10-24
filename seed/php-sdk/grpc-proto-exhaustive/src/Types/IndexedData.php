<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class IndexedData extends JsonSerializableType
{
    /**
     * @var array<int> $indices
     */
    #[JsonProperty('indices'), ArrayType(['integer'])]
    public array $indices;

    /**
     * @var array<float> $values
     */
    #[JsonProperty('values'), ArrayType(['float'])]
    public array $values;

    /**
     * @param array{
     *   indices: array<int>,
     *   values: array<float>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->indices = $values['indices'];
        $this->values = $values['values'];
    }
}
