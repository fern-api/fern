<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DeepEqualityCorrectnessCheck extends SerializableType
{
    /**
     * @var string $expectedValueParameterId
     */
    #[JsonProperty("expectedValueParameterId")]
    public string $expectedValueParameterId;

    /**
     * @param string $expectedValueParameterId
     */
    public function __construct(
        string $expectedValueParameterId,
    ) {
        $this->expectedValueParameterId = $expectedValueParameterId;
    }
}
