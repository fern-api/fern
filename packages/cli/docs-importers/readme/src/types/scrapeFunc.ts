import type { Element } from "hast";

import type { HastNode, HastNodeIndex, HastNodeParent } from "./hastTypes";

export type ScrapeFuncType = (node: HastNode, index: HastNodeIndex, parent: HastNodeParent) => Element | undefined;
