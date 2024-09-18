<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\V3\Problem\Types\TestCaseV2;
use Seed\V2\V3\Problem\Types\TestCaseTemplate;

class GetGeneratedTestCaseFileRequest extends SerializableType
{
    #[JsonProperty("testCase")]
    /**
     * @var TestCaseV2 $testCase
     */
    public TestCaseV2 $testCase;

    #[JsonProperty("template")]
    /**
     * @var ?TestCaseTemplate $template
     */
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
