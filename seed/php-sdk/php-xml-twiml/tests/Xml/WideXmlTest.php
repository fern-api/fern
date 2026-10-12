<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Wide;

class WideXmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Wide::fromXml('<Wide><Pause/></Wide>');
        $serialized = $parsed->toXml(false);
        $this->assertSame($serialized, Wide::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Wide::fromXml('<Wide dataUnknown="1"><Unknown a="1">v</Unknown></Wide>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Wide::fromXml($serialized)->toXml(false));
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Wide::fromXml('<NotTheWide/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Wide::fromXml('<Wide><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Wide::fromXml('<!DOCTYPE Wide [<!ENTITY xxe "injected">]><Wide>&xxe;</Wide>');
    }
}
