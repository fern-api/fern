<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetBasicSolutionFileRequest extends JsonSerializableType
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
     * @param array{
     *   methodName: string,
     *   signature: NonVoidFunctionSignature,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->methodName = $values['methodName'];$this->signature = $values['signature'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
