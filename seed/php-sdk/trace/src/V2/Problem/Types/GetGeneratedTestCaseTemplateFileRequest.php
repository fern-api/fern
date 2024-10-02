<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class GetGeneratedTestCaseTemplateFileRequest extends SerializableType
{
    /**
     * @var TestCaseTemplate $template
     */
    #[JsonProperty('template')]
    public TestCaseTemplate $template;

    /**
     * @param array{
     *   template: TestCaseTemplate,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->template = $values['template'];
    }
}
