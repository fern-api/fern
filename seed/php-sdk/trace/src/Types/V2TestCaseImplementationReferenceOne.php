<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2TestCaseImplementation;
use Seed\Core\Json\JsonProperty;

class V2TestCaseImplementationReferenceOne extends JsonSerializableType
{
    use V2TestCaseImplementation;

    /**
     * @var value-of<V2TestCaseImplementationReferenceOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   description: V2TestCaseImplementationDescription,
     *   function: (
     *    V2TestCaseFunctionZero
     *   |V2TestCaseFunctionOne
     * ),
     *   type: value-of<V2TestCaseImplementationReferenceOneType>,
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
