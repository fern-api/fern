<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class LeafObjectA extends JsonSerializableType
{
    /**
     * @var string $onlyInA
     */
    #[JsonProperty('onlyInA')]
    public string $onlyInA;

    /**
     * @var int $sharedNumber
     */
    #[JsonProperty('sharedNumber')]
    public int $sharedNumber;

    /**
     * @param array{
     *   onlyInA: string,
     *   sharedNumber: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->onlyInA = $values['onlyInA'];
        $this->sharedNumber = $values['sharedNumber'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
