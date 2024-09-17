<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\TestCaseImplementationDescription;

class BasicTestCaseTemplate extends SerializableType
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

    #[JsonProperty("description")]
    /**
     * @var TestCaseImplementationDescription $description
     */
    public TestCaseImplementationDescription $description;

    #[JsonProperty("expectedValueParameterId")]
    /**
     * @var string $expectedValueParameterId
     */
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
