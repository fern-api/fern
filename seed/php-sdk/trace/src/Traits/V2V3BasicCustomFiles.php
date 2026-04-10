<?php

namespace Seed\Traits;

use Seed\Types\V2V3NonVoidFunctionSignature;
use Seed\Types\V2V3Files;
use Seed\Types\V2V3BasicTestCaseTemplate;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $methodName
 * @property V2V3NonVoidFunctionSignature $signature
 * @property array<string, V2V3Files> $additionalFiles
 * @property V2V3BasicTestCaseTemplate $basicTestCaseTemplate
 */
trait V2V3BasicCustomFiles
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
}
