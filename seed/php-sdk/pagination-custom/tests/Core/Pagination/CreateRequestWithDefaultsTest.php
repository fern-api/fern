<?php

namespace Seed\Tests\Core\Pagination;

use PHPUnit\Framework\TestCase;
use Seed\Core\Pagination\PaginationHelper;

class SearchRequest
{
    /**
     * @var ?StartingAfterPaging $pagination
     */
    public ?StartingAfterPaging $pagination;

    /**
     * @var SingleFilterSearchRequest|MultipleFilterSearchRequest $query
     */
    public SingleFilterSearchRequest|MultipleFilterSearchRequest $query;

    /**
     * @param array{
     *   pagination?: ?StartingAfterPaging,
     *   query: SingleFilterSearchRequest|MultipleFilterSearchRequest,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->pagination = $values['pagination'] ?? null;
        $this->query = $values['query'];
    }
}

class StartingAfterPaging
{
    /**
     * @var int $perPage
     */
    public int $perPage;

    /**
     * @var ?string $startingAfter
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   perPage: int,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->perPage = $values['perPage'];
        $this->startingAfter = $values['startingAfter'] ?? null;
    }
}

class SingleFilterSearchRequest
{
    /**
     * @var ?string $field
     */
    public ?string $field;

    /**
     * @var ?string $operator
     */
    public ?string $operator;

    /**
     * @var ?string $value
     */
    public ?string $value;

    /**
     * @param array{
     *   field?: ?string,
     *   operator?: ?string,
     *   value?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->field = $values['field'] ?? null;
        $this->operator = $values['operator'] ?? null;
        $this->value = $values['value'] ?? null;
    }
}

class MultipleFilterSearchRequest
{
    /**
     * @var ?string $operator
     */
    public ?string $operator;

    /**
     * @var array<MultipleFilterSearchRequest>|array<SingleFilterSearchRequest>|null $value
     */
    public array|null $value;

    /**
     * @param array{
     *   operator?: ?string,
     *   value?: array<MultipleFilterSearchRequest>|array<SingleFilterSearchRequest>|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->operator = $values['operator'] ?? null;
        $this->value = $values['value'] ?? null;
    }
}

class CreateRequestWithDefaultsTest extends TestCase
{
    public function testCreateInstanceWithDefaults(): void
    {
        $instance = PaginationHelper::createRequestWithDefaults(SearchRequest::class);
        $this->assertInstanceOf(SearchRequest::class, $instance);
        $this->assertNull($instance->pagination);
        $this->assertInstanceOf(SingleFilterSearchRequest::class, $instance->query);
        $this->assertNull($instance->query->field);
        $this->assertNull($instance->query->operator);
        $this->assertNull($instance->query->value);
    }
}
