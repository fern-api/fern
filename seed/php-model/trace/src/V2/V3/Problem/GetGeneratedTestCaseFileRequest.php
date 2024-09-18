<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetGeneratedTestCaseFileRequest extends SerializableType
{
    /**
     * @var TestCaseV2 $testCase
     */
    #[JsonProperty("testCase")]
    public TestCaseV2 $testCase;

    /**
     * @var ?TestCaseTemplate $template
     */
    #[JsonProperty("template")]
    public ?TestCaseTemplate $template;

    /**
     * @param TestCaseV2 $testCase
     * @param ?TestCaseTemplate $template
     */
    public function __construct(
        TestCaseV2 $testCase,
        ?TestCaseTemplate $template = null,
    ) {
        $this->testCase = $testCase;
        $this->template = $template;
    }
}
