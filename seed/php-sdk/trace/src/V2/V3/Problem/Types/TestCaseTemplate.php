<?php

namespace Seed\V2\V3\Problem\Types;

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
     * @param array{
     *   templateId: string,
     *   name: string,
     *   implementation: TestCaseImplementation,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->templateId = $values['templateId'];
        $this->name = $values['name'];
        $this->implementation = $values['implementation'];
    }
}
