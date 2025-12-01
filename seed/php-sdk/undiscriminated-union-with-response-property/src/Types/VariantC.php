<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariantC extends JsonSerializableType
{
    /**
     * @var 'C' $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var bool $valueC
     */
    #[JsonProperty('valueC')]
    public bool $valueC;

    /**
     * @param array{
     *   type: 'C',
     *   valueC: bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->valueC = $values['valueC'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
