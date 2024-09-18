<?php

namespace Seed\Problem\Requests;

use Seed\Problem\Types\VariableTypeAndName;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetDefaultStarterFilesRequest
{
    /**
     * @var array<VariableTypeAndName> $inputParams
     */
    #[JsonProperty("inputParams"), ArrayType([VariableTypeAndName::class])]
    public array $inputParams;

    /**
     * @var mixed $outputType
     */
    #[JsonProperty("outputType")]
    public mixed $outputType;

    /**
     * @var string $methodName The name of the `method` that the student has to complete.
    The method name cannot include the following characters:
      - Greater Than `>`
      - Less Than `<``
      - Equals `=`
      - Period `.`

     */
    #[JsonProperty("methodName")]
    public string $methodName;

    /**
     * @param array<VariableTypeAndName> $inputParams
     * @param mixed $outputType
     * @param string $methodName The name of the `method` that the student has to complete.
    The method name cannot include the following characters:
      - Greater Than `>`
      - Less Than `<``
      - Equals `=`
      - Period `.`

     */
    public function __construct(
        array $inputParams,
        mixed $outputType,
        string $methodName,
    ) {
        $this->inputParams = $inputParams;
        $this->outputType = $outputType;
        $this->methodName = $methodName;
    }
}
