<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class StackFrame extends SerializableType
{
    /**
     * @var string $methodName
     */
    #[JsonProperty("methodName")]
    public string $methodName;

    /**
     * @var int $lineNumber
     */
    #[JsonProperty("lineNumber")]
    public int $lineNumber;

    /**
     * @var array<Scope> $scopes
     */
    #[JsonProperty("scopes"), ArrayType([Scope::class])]
    public array $scopes;

    /**
     * @param string $methodName
     * @param int $lineNumber
     * @param array<Scope> $scopes
     */
    public function __construct(
        string $methodName,
        int $lineNumber,
        array $scopes,
    ) {
        $this->methodName = $methodName;
        $this->lineNumber = $lineNumber;
        $this->scopes = $scopes;
    }
}
