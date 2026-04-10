<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class V2V3TestCaseImplementation extends JsonSerializableType
{
    /**
     * @var V2V3TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public V2V3TestCaseImplementationDescription $description;

    /**
     * @var (
     *    V2V3TestCaseFunctionZero
     *   |V2V3TestCaseFunctionOne
     * ) $function
     */
    #[JsonProperty('function'), Union(V2V3TestCaseFunctionZero::class, V2V3TestCaseFunctionOne::class)]
    public V2V3TestCaseFunctionZero|V2V3TestCaseFunctionOne $function;

    /**
     * @param array{
     *   description: V2V3TestCaseImplementationDescription,
     *   function: (
     *    V2V3TestCaseFunctionZero
     *   |V2V3TestCaseFunctionOne
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->description = $values['description'];
        $this->function = $values['function'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
