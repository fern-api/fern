<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class WrapperObject extends JsonSerializableType
{
    /**
     * @var (
     *    LeafTypeA
     *   |LeafTypeB
     * ) $inner
     */
    #[JsonProperty('inner'), Union(LeafTypeA::class, LeafTypeB::class)]
    public LeafTypeA|LeafTypeB $inner;

    /**
     * @var string $label
     */
    #[JsonProperty('label')]
    public string $label;

    /**
     * @param array{
     *   inner: (
     *    LeafTypeA
     *   |LeafTypeB
     * ),
     *   label: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->inner = $values['inner'];
        $this->label = $values['label'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
