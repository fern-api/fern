<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class IndexedData extends SerializableType
{
    /**
     * @var array<int> $indices
     */
    #[JsonProperty("indices"), ArrayType(["integer"])]
    public array $indices;

    /**
     * @var array<float> $values
     */
    #[JsonProperty("values"), ArrayType(["float"])]
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
