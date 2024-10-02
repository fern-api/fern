<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseImplementation extends SerializableType
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
}
