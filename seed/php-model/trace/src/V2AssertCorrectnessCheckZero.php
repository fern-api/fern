<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2DeepEqualityCorrectnessCheck;
use Seed\Core\Json\JsonProperty;

class V2AssertCorrectnessCheckZero extends JsonSerializableType
{
    use V2DeepEqualityCorrectnessCheck;

    /**
     * @var value-of<V2AssertCorrectnessCheckZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   expectedValueParameterId: string,
     *   type: value-of<V2AssertCorrectnessCheckZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedValueParameterId = $values['expectedValueParameterId'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
