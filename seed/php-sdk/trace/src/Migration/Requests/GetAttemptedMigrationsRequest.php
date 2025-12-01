<?php

namespace Seed\Migration\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetAttemptedMigrationsRequest extends JsonSerializableType
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
    )
    {
        $this->adminKeyHeader = $values['adminKeyHeader'];
    }
}
