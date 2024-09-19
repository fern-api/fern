<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseTemplate extends SerializableType
{
    /**
     * @var string $templateId
     */
    #[JsonProperty("templateId")]
    public string $templateId;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var TestCaseImplementation $implementation
     */
    #[JsonProperty("implementation")]
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
