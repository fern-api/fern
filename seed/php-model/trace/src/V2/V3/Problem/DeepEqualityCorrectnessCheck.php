<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DeepEqualityCorrectnessCheck extends JsonSerializableType
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
    )
    {
        $this->expectedValueParameterId = $values['expectedValueParameterId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
