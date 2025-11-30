<?php

namespace Seed\V2\V3\Problem;

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
     * @var TestCaseFunction $function
     */
    #[JsonProperty('function')]
    public TestCaseFunction $function;

    /**
     * @param array{
     *   description: TestCaseImplementationDescription,
     *   function: TestCaseFunction,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->description = $values['description'];$this->function = $values['function'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
