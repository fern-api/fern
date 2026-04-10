<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2V3TestCaseTemplate extends JsonSerializableType
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
     * @var V2V3TestCaseImplementation $implementation
     */
    #[JsonProperty('implementation')]
    public V2V3TestCaseImplementation $implementation;

    /**
     * @param array{
     *   templateId: string,
     *   name: string,
     *   implementation: V2V3TestCaseImplementation,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->templateId = $values['templateId'];
        $this->name = $values['name'];
        $this->implementation = $values['implementation'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
