<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Break_;

class Break_XmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Break_::fromXml('<break/>');
        $serialized = $parsed->toXml(false);
        $this->assertSame($serialized, Break_::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Break_::fromXml('<break dataUnknown="1"><Unknown a="1">v</Unknown></break>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Break_::fromXml($serialized)->toXml(false));
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Break_::fromXml('<NotThebreak/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Break_::fromXml('<break><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Break_::fromXml('<!DOCTYPE break [<!ENTITY xxe "injected">]><break>&xxe;</break>');
    }
}
