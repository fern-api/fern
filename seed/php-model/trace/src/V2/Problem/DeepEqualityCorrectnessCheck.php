<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class DeepEqualityCorrectnessCheck extends SerializableType
{
    /**
     * @var string $expectedValueParameterId
     */
    #[JsonProperty('expectedValueParameterId')]
    public string $expectedValueParameterId;

    /**
     * @param array{
     *   expectedValueParameterId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedValueParameterId = $values['expectedValueParameterId'];
    }
}
