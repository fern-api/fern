<?php

namespace Seed\Traits;

use Seed\Types\V2NonVoidFunctionSignature;
use Seed\Types\V2Files;
use Seed\Types\V2BasicTestCaseTemplate;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $methodName
 * @property V2NonVoidFunctionSignature $signature
 * @property array<string, V2Files> $additionalFiles
 * @property V2BasicTestCaseTemplate $basicTestCaseTemplate
 */
trait V2BasicCustomFiles
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
}
