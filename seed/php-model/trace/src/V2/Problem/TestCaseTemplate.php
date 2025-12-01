<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestCaseTemplate extends JsonSerializableType
{
    /**
     * @var string $templateId
     */
    #[JsonProperty('templateId')]
    public string $templateId;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var TestCaseImplementation $implementation
     */
    #[JsonProperty('implementation')]
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
    )
    {
        $this->templateId = $values['templateId'];$this->name = $values['name'];$this->implementation = $values['implementation'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
