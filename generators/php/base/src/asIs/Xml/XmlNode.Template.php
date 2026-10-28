<?php

namespace <%= namespace%>;

/**
 * Anything that can be rendered as an XML element.
 */
interface XmlNode
{
    /**
     * Renders this value as a generic XML element tree.
     */
    public function toXmlElement(): XmlElement;
}
