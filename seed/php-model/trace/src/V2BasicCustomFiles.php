<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2BasicCustomFiles extends JsonSerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @var V2NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public V2NonVoidFunctionSignature $signature;

    /**
     * @var array<string, V2Files> $additionalFiles
     */
    #[JsonProperty('additionalFiles'), ArrayType(['string' => V2Files::class])]
    public array $additionalFiles;

    /**
     * @var V2BasicTestCaseTemplate $basicTestCaseTemplate
     */
    #[JsonProperty('basicTestCaseTemplate')]
    public V2BasicTestCaseTemplate $basicTestCaseTemplate;

    /**
     * @param array{
     *   methodName: string,
     *   signature: V2NonVoidFunctionSignature,
     *   additionalFiles: array<string, V2Files>,
     *   basicTestCaseTemplate: V2BasicTestCaseTemplate,
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
