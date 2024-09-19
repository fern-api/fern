<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BasicTestCaseTemplate extends SerializableType
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
     * @var TestCaseImplementationDescription $description
     */
    #[JsonProperty("description")]
    public TestCaseImplementationDescription $description;

    /**
     * @var string $expectedValueParameterId
     */
    #[JsonProperty("expectedValueParameterId")]
    public string $expectedValueParameterId;

    /**
     * @param string $templateId
     * @param string $name
     * @param TestCaseImplementationDescription $description
     * @param string $expectedValueParameterId
     */
    public function __construct(
        string $templateId,
        string $name,
        TestCaseImplementationDescription $description,
        string $expectedValueParameterId,
    ) {
        $this->templateId = $templateId;
        $this->name = $name;
        $this->description = $description;
        $this->expectedValueParameterId = $expectedValueParameterId;
    }
}
