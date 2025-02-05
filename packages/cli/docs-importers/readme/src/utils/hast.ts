import type { Root as HastRoot } from "hast";
import rehypeParse from "rehype-parse";
import { unified } from "unified";

import { rehypeRemoveHastComments } from "../cleaners/hastComments";
import { unifiedRemovePositions } from "../cleaners/position";

export function htmlToHast(html: string): HastRoot {
    return unified().use(rehypeParse).use(unifiedRemovePositions).use(rehypeRemoveHastComments).parse(html);
}
