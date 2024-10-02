<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class GetGeneratedTestCaseFileRequest extends SerializableType
{
    /**
     * @var ?TestCaseTemplate $template
     */
    #[JsonProperty('template')]
    public ?TestCaseTemplate $template;

    /**
     * @var TestCaseV2 $testCase
     */
    #[JsonProperty('testCase')]
    public TestCaseV2 $testCase;

    /**
     * @param array{
     *   template?: ?TestCaseTemplate,
     *   testCase: TestCaseV2,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->template = $values['template'] ?? null;
        $this->testCase = $values['testCase'];
    }
}
