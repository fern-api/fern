<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetGeneratedTestCaseTemplateFileRequest extends JsonSerializableType
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
    )
    {
        $this->template = $values['template'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
