<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Number;

class NumberXmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Number::fromXml('<Number/>');
        $serialized = $parsed->toXml(false);
        $this->assertSame($serialized, Number::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Number::fromXml('<Number dataUnknown="1"><Unknown a="1">v</Unknown></Number>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Number::fromXml($serialized)->toXml(false));
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Number::fromXml('<NotTheNumber/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Number::fromXml('<Number><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Number::fromXml('<!DOCTYPE Number [<!ENTITY xxe "injected">]><Number>&xxe;</Number>');
    }
}
