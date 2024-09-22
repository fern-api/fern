<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

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
