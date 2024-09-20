<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
use Seed\Core\ArrayType;

class BasicCustomFiles extends SerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @var NonVoidFunctionSignature $signature
     */
    #[JsonProperty('signature')]
    public NonVoidFunctionSignature $signature;

    /**
     * @var array<Language, Files> $additionalFiles
     */
    #[JsonProperty('additionalFiles'), ArrayType([Language::class => Files::class])]
    public array $additionalFiles;

    /**
     * @var BasicTestCaseTemplate $basicTestCaseTemplate
     */
    #[JsonProperty('basicTestCaseTemplate')]
    public BasicTestCaseTemplate $basicTestCaseTemplate;

    /**
     * @param array{
     *   methodName: string,
     *   signature: NonVoidFunctionSignature,
     *   additionalFiles: array<Language, Files>,
     *   basicTestCaseTemplate: BasicTestCaseTemplate,
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
}
