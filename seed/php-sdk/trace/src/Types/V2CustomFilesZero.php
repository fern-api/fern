<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2BasicCustomFiles;
use Seed\Core\Json\JsonProperty;

class V2CustomFilesZero extends JsonSerializableType
{
    use V2BasicCustomFiles;

    /**
     * @var value-of<V2CustomFilesZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   methodName: string,
     *   signature: V2NonVoidFunctionSignature,
     *   additionalFiles: array<string, V2Files>,
     *   basicTestCaseTemplate: V2BasicTestCaseTemplate,
     *   type: value-of<V2CustomFilesZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->methodName = $values['methodName'];
        $this->signature = $values['signature'];
        $this->additionalFiles = $values['additionalFiles'];
        $this->basicTestCaseTemplate = $values['basicTestCaseTemplate'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
