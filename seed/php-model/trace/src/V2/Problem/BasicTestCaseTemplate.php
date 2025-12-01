<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BasicTestCaseTemplate extends JsonSerializableType
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
     * @var TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public TestCaseImplementationDescription $description;

    /**
     * @var string $expectedValueParameterId
     */
    #[JsonProperty('expectedValueParameterId')]
    public string $expectedValueParameterId;

    /**
     * @param array{
     *   templateId: string,
     *   name: string,
     *   description: TestCaseImplementationDescription,
     *   expectedValueParameterId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->templateId = $values['templateId'];$this->name = $values['name'];$this->description = $values['description'];$this->expectedValueParameterId = $values['expectedValueParameterId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
