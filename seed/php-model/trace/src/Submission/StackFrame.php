<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\Scope;

class StackFrame extends SerializableType
{
    #[JsonProperty("methodName")]
    /**
     * @var string $methodName
     */
    public string $methodName;

    #[JsonProperty("lineNumber")]
    /**
     * @var int $lineNumber
     */
    public int $lineNumber;

    #[JsonProperty("scopes"), ArrayType([Scope])]
    /**
     * @var array<Scope> $scopes
     */
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
