<?php

namespace Seed\Tests\Core\Pagination;

use PHPUnit\Framework\TestCase;
use Seed\Core\Pagination\PaginationHelper;

class RootObjectAccessors
{
    private ?Level1ObjectAccessors $level1;

    public function getLevel1(): ?Level1ObjectAccessors
    {
        return $this->level1;
    }

    /**
     * @param ?array{
     *     level1?: ?Level1ObjectAccessors,
     * } $data
     */
    public function __construct(?array $data = [])
    {
        $this->level1 = $data['level1'] ?? null;
    }
}

class Level1ObjectAccessors
{
    private ?Level2ObjectAccessors $level2;

    public function getLevel2(): ?Level2ObjectAccessors
    {
        return $this->level2;
    }

    /**
     * @param ?array{
     *     level2?: ?Level2ObjectAccessors,
     * } $data
     */
    public function __construct(?array $data = [])
    {
        $this->level2 = $data['level2'] ?? null;
    }
}

class Level2ObjectAccessors
{
    private ?string $level3;

    /**
     * @return string|null
     */
    public function getLevel3(): ?string
    {
        return $this->level3;
    }

    /**
     * @param ?array{
     *     level3?: ?string,
     * } $data
     */
    public function __construct(?array $data = [])
    {
        $this->level3 = $data['level3'] ?? null;
    }
}

class DeepSetAccessorsTest extends TestCase
{
    public function testSetNestedPropertyWithNull(): void
    {
        $object = new RootObjectAccessors();

        $this->assertNull($object->getLevel1());

        PaginationHelper::setDeep($object, ['level1', 'level2', 'level3'], 'testValue');

        $this->assertEquals('testValue', $object->getLevel1()?->getLevel2()?->getLevel3());
    }

    public function testSetNestedProperty(): void
    {
        $object = new RootObjectAccessors([
            "level1" => new Level1ObjectAccessors([
                "level2" => new Level2ObjectAccessors([
                    "level3" => null
                ])
            ])
        ]);

        $this->assertNull($object->getLevel1()?->getLevel2()?->getLevel3());

        PaginationHelper::setDeep($object, ['level1', 'level2', 'level3'], 'testValue');

        $this->assertEquals('testValue', $object->getLevel1()?->getLevel2()?->getLevel3());
    }

}