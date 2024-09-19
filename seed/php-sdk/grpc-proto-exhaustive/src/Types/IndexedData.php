<?php

namespace Seed\Types;

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
     * @param array<int> $indices
     * @param array<float> $values
     */
    public function __construct(
        array $indices,
        array $values,
    ) {
        $this->indices = $indices;
        $this->values = $values;
    }
}
