<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BasicTestCaseTemplate extends SerializableType
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
    ) {
        $this->templateId = $values['templateId'];
        $this->name = $values['name'];
        $this->description = $values['description'];
        $this->expectedValueParameterId = $values['expectedValueParameterId'];
    }
}
