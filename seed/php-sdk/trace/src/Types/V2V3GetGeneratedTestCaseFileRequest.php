<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2V3GetGeneratedTestCaseFileRequest extends JsonSerializableType
{
    /**
     * @var ?V2V3TestCaseTemplate $template
     */
    #[JsonProperty('template')]
    public ?V2V3TestCaseTemplate $template;

    /**
     * @var V2V3TestCaseV2 $testCase
     */
    #[JsonProperty('testCase')]
    public V2V3TestCaseV2 $testCase;

    /**
     * @param array{
     *   testCase: V2V3TestCaseV2,
     *   template?: ?V2V3TestCaseTemplate,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->template = $values['template'] ?? null;
        $this->testCase = $values['testCase'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
