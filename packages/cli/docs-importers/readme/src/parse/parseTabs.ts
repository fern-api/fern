import type { Element, Root as HastRoot } from 'hast'
import { CONTINUE, EXIT, visit } from 'unist-util-visit'

import { findTitle, getTitleFromLink } from '../extract/title'
import { scrapedTab } from '../types/scrapedTab'

export function parseTabLinks(rootNode: HastRoot): Array<scrapedTab> | undefined {
    let element: Element | undefined = undefined as Element | undefined
    visit(rootNode, 'element', function (node) {
        if (
            node.tagName === 'header' &&
            node.properties.className &&
            Array.isArray(node.properties.className) &&
            node.properties.className.includes('rm-Header')
        ) {
            element = node
            return EXIT
        }
        return CONTINUE
    })

    if (!element) {
        return undefined
    }

    const links: Array<scrapedTab> = []
    visit(element as Element, 'element', function (node) {
        if (
            node.tagName !== 'nav' &&
            !(
                node.tagName === 'div' &&
                node.properties.className &&
                Array.isArray(node.properties.className) &&
                node.properties.className.includes('rm-Header-right')
            )
        ) {
            return CONTINUE
        }

        visit(node, 'element', function (subNode) {
            if (
                subNode.tagName !== 'a' ||
                !subNode.properties.href ||
                typeof subNode.properties.href !== 'string' ||
                subNode.properties.href.startsWith('http')
            ) {
                return CONTINUE
            }
            const title = findTitle(subNode)
            const tabTitle = title || getTitleFromLink(subNode.properties.href)

            // Skip if title is "Recipes"
            if (tabTitle === 'Recipes') {
                return CONTINUE
            }

            links.push({
                name: tabTitle,
                url: subNode.properties.href
            })
            return CONTINUE
        })
        return CONTINUE
    })

    return links
}
