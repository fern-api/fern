<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2BasicTestCaseTemplate extends JsonSerializableType
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
     * @var V2TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public V2TestCaseImplementationDescription $description;

    /**
     * @var string $expectedValueParameterId
     */
    #[JsonProperty('expectedValueParameterId')]
    public string $expectedValueParameterId;

    /**
     * @param array{
     *   templateId: string,
     *   name: string,
     *   description: V2TestCaseImplementationDescription,
     *   expectedValueParameterId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->templateId = $values['templateId'];
        $this->name = $values['name'];
        $this->description = $values['description'];
        $this->expectedValueParameterId = $values['expectedValueParameterId'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
