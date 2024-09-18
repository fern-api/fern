<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\Types\TestCaseImplementation;

class TestCaseTemplate extends SerializableType
{
    #[JsonProperty("templateId")]
    /**
     * @var string $templateId
     */
    public string $templateId;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("implementation")]
    /**
     * @var TestCaseImplementation $implementation
     */
    public TestCaseImplementation $implementation;

    /**
     * @param string $templateId
     * @param string $name
     * @param TestCaseImplementation $implementation
     */
    public function __construct(
        string $templateId,
        string $name,
        TestCaseImplementation $implementation,
    ) {
        $this->templateId = $templateId;
        $this->name = $name;
        $this->implementation = $implementation;
    }
}
