<?php

namespace Seed\Migration\Requests;

use Seed\Core\Json\SerializableType;

class GetAttemptedMigrationsRequest extends SerializableType
{
    /**
     * @var string $adminKeyHeader
     */
    public string $adminKeyHeader;

    /**
     * @param array{
     *   adminKeyHeader: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->adminKeyHeader = $values['adminKeyHeader'];
    }
}
