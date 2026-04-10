<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3BasicCustomFiles extends JsonSerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @var V2V3NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public V2V3NonVoidFunctionSignature $signature;

    /**
     * @var array<string, V2V3Files> $additionalFiles
     */
    #[JsonProperty('additionalFiles'), ArrayType(['string' => V2V3Files::class])]
    public array $additionalFiles;

    /**
     * @var V2V3BasicTestCaseTemplate $basicTestCaseTemplate
     */
    #[JsonProperty('basicTestCaseTemplate')]
    public V2V3BasicTestCaseTemplate $basicTestCaseTemplate;

    /**
     * @param array{
     *   methodName: string,
     *   signature: V2V3NonVoidFunctionSignature,
     *   additionalFiles: array<string, V2V3Files>,
     *   basicTestCaseTemplate: V2V3BasicTestCaseTemplate,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->methodName = $values['methodName'];
        $this->signature = $values['signature'];
        $this->additionalFiles = $values['additionalFiles'];
        $this->basicTestCaseTemplate = $values['basicTestCaseTemplate'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
