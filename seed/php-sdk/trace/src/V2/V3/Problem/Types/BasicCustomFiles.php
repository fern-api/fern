<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
use Seed\Core\ArrayType;

class BasicCustomFiles extends SerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty("methodName")]
    public string $methodName;

    /**
     * @var NonVoidFunctionSignature $signature
     */
    #[JsonProperty("signature")]
    public NonVoidFunctionSignature $signature;

    /**
     * @var array<Language, Files> $additionalFiles
     */
    #[JsonProperty("additionalFiles"), ArrayType([Language::class => Files::class])]
    public array $additionalFiles;

    /**
     * @var BasicTestCaseTemplate $basicTestCaseTemplate
     */
    #[JsonProperty("basicTestCaseTemplate")]
    public BasicTestCaseTemplate $basicTestCaseTemplate;

    /**
     * @param string $methodName
     * @param NonVoidFunctionSignature $signature
     * @param array<Language, Files> $additionalFiles
     * @param BasicTestCaseTemplate $basicTestCaseTemplate
     */
    public function __construct(
        string $methodName,
        NonVoidFunctionSignature $signature,
        array $additionalFiles,
        BasicTestCaseTemplate $basicTestCaseTemplate,
    ) {
        $this->methodName = $methodName;
        $this->signature = $signature;
        $this->additionalFiles = $additionalFiles;
        $this->basicTestCaseTemplate = $basicTestCaseTemplate;
    }
}
