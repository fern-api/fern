<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\V2\Problem\Types\TestCaseTemplate;

class GetGeneratedTestCaseTemplateFileRequest extends SerializableType
{
    #[JsonProperty("template")]
    /**
     * @var TestCaseTemplate $template
     */
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
