<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\V2V3BasicCustomFiles;
use Seed\Core\Json\JsonProperty;

class V2V3CustomFilesZero extends JsonSerializableType
{
    use V2V3BasicCustomFiles;

    /**
     * @var value-of<V2V3CustomFilesZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   methodName: string,
     *   signature: V2V3NonVoidFunctionSignature,
     *   additionalFiles: array<string, V2V3Files>,
     *   basicTestCaseTemplate: V2V3BasicTestCaseTemplate,
     *   type: value-of<V2V3CustomFilesZeroType>,
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
