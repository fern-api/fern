<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TestSubmissionUpdate;

class AdminSendTestSubmissionUpdateRequest extends JsonSerializableType
{
    /**
     * @var TestSubmissionUpdate $body
     */
    public TestSubmissionUpdate $body;

    /**
     * @param array{
     *   body: TestSubmissionUpdate,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
