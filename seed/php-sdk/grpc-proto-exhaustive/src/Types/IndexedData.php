<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class IndexedData extends SerializableType
{
    #[JsonProperty("indices"), ArrayType(["integer"])]
    /**
     * @var array<int> $indices
     */
    public array $indices;

    #[JsonProperty("values"), ArrayType(["float"])]
    /**
     * @var array<float> $values
     */
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
