<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class V2GetGeneratedTestCaseFileRequest extends JsonSerializableType
{
    /**
     * @var ?V2TestCaseTemplate $template
     */
    #[JsonProperty('template')]
    public ?V2TestCaseTemplate $template;

    /**
     * @var V2TestCaseV2 $testCase
     */
    #[JsonProperty('testCase')]
    public V2TestCaseV2 $testCase;

    /**
     * @param array{
     *   testCase: V2TestCaseV2,
     *   template?: ?V2TestCaseTemplate,
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
