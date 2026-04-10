<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3TestCaseImplementation;
use Seed\Core\Json\JsonProperty;

class V2V3TestCaseImplementationReferenceOne extends JsonSerializableType
{
    use V2V3TestCaseImplementation;

    /**
     * @var value-of<V2V3TestCaseImplementationReferenceOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   description: V2V3TestCaseImplementationDescription,
     *   function: (
     *    V2V3TestCaseFunctionZero
     *   |V2V3TestCaseFunctionOne
     * ),
     *   type: value-of<V2V3TestCaseImplementationReferenceOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->description = $values['description'];
        $this->function = $values['function'];
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
