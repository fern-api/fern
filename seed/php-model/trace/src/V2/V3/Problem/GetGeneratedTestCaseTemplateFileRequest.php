<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetGeneratedTestCaseTemplateFileRequest extends SerializableType
{
    /**
     * @var TestCaseTemplate $template
     */
    #[JsonProperty("template")]
    public TestCaseTemplate $template;

    /**
     * @param TestCaseTemplate $template
     */
    public function __construct(
        TestCaseTemplate $template,
    ) {
        $this->template = $template;
    }
}
