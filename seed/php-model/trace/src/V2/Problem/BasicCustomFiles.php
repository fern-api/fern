<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\Problem\NonVoidFunctionSignature;
use Seed\Core\ArrayType;
use Seed\Commons\Language;
use Seed\V2\Problem\Files;
use Seed\V2\Problem\BasicTestCaseTemplate;

class BasicCustomFiles extends SerializableType
{
    #[JsonProperty("methodName")]
    /**
     * @var string $methodName
     */
    public string $methodName;

    #[JsonProperty("signature")]
    /**
     * @var NonVoidFunctionSignature $signature
     */
    public NonVoidFunctionSignature $signature;

    #[JsonProperty("additionalFiles"), ArrayType([Language::class => Files::class])]
    /**
     * @var array<Language, Files> $additionalFiles
     */
    public array $additionalFiles;

    #[JsonProperty("basicTestCaseTemplate")]
    /**
     * @var BasicTestCaseTemplate $basicTestCaseTemplate
     */
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
