<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3DeepEqualityCorrectnessCheck;
use Seed\Core\Json\JsonProperty;

class V2V3AssertCorrectnessCheckZero extends JsonSerializableType
{
    use V2V3DeepEqualityCorrectnessCheck;

    /**
     * @var value-of<V2V3AssertCorrectnessCheckZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   expectedValueParameterId: string,
     *   type: value-of<V2V3AssertCorrectnessCheckZeroType>,
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
