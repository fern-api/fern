<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseImplementation extends SerializableType
{
    /**
     * @var TestCaseImplementationDescription $description
     */
    #[JsonProperty("description")]
    public TestCaseImplementationDescription $description;

    /**
     * @var mixed $function
     */
    #[JsonProperty("function")]
    public mixed $function;

    /**
     * @param TestCaseImplementationDescription $description
     * @param mixed $function
     */
    public function __construct(
        TestCaseImplementationDescription $description,
        mixed $function,
    ) {
        $this->description = $description;
        $this->function = $function;
    }
}
