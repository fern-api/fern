<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\Types\TestCaseImplementationDescription;

class TestCaseImplementation extends SerializableType
{
    #[JsonProperty("description")]
    /**
     * @var TestCaseImplementationDescription $description
     */
    public TestCaseImplementationDescription $description;

    #[JsonProperty("function")]
    /**
     * @var mixed $function_
     */
    public mixed $function_;

    /**
     * @param TestCaseImplementationDescription $description
     * @param mixed $function_
     */
    public function __construct(
        TestCaseImplementationDescription $description,
        mixed $function_,
    ) {
        $this->description = $description;
        $this->function_ = $function_;
    }
}
