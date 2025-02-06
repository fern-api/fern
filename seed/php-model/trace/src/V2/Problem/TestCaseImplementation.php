<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseImplementation extends JsonSerializableType
{
    /**
     * @var TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public TestCaseImplementationDescription $description;

    /**
     * @var mixed $function
     */
    #[JsonProperty('function')]
    public mixed $function;

    /**
     * @param array{
     *   description: TestCaseImplementationDescription,
     *   function: mixed,
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
