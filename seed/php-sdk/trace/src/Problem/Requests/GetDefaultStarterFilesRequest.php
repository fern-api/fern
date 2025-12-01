<?php

namespace Seed\Problem\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Problem\Types\VariableTypeAndName;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Commons\Types\VariableType;

class GetDefaultStarterFilesRequest extends JsonSerializableType
{
    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    #[JsonProperty('inputParams'), ArrayType([VariableTypeAndName::class])]
    public array $inputParams;

    /**
     * @var VariableType $outputType
     */
    #[JsonProperty('outputType')]
    public VariableType $outputType;

    /**
     * The name of the `method` that the student has to complete.
     * The method name cannot include the following characters:
     *   - Greater Than `>`
     *   - Less Than `<``
     *   - Equals `=`
     *   - Period `.`
     *
     * @var string $methodName
     */
    #[JsonProperty('methodName')]
    public string $methodName;

    /**
     * @param array{
     *   inputParams: array<VariableTypeAndName>,
     *   outputType: VariableType,
     *   methodName: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->inputParams = $values['inputParams'];$this->outputType = $values['outputType'];$this->methodName = $values['methodName'];
    }
}
