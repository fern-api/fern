<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class V2TestCaseImplementation extends JsonSerializableType
{
    /**
     * @var V2TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public V2TestCaseImplementationDescription $description;

    /**
     * @var (
     *    V2TestCaseFunctionZero
     *   |V2TestCaseFunctionOne
     * ) $function
     */
    #[JsonProperty('function'), Union(V2TestCaseFunctionZero::class, V2TestCaseFunctionOne::class)]
    public V2TestCaseFunctionZero|V2TestCaseFunctionOne $function;

    /**
     * @param array{
     *   description: V2TestCaseImplementationDescription,
     *   function: (
     *    V2TestCaseFunctionZero
     *   |V2TestCaseFunctionOne
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
