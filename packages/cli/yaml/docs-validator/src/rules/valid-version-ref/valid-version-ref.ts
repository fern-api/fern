import { getVersionContentRef } from "@fern-api/configuration-loader";

import { Rule } from "../../Rule.js";

export const ValidVersionRefRule: Rule = {
    name: "valid-version-ref",
    create: () => {
        return {
            version: ({ version }) => {
                const ref = getVersionContentRef(version);
                // A git-ref-backed version builds its content root from the ref itself
                // (the ref's own `versions[0].path` or top-level `navigation:`), so a
                // current-branch `path:` has no effect. Reject the combination rather
                // than silently ignoring `path:`.
                if (ref != null && version.path != null) {
                    return [
                        {
                            severity: "error",
                            message:
                                `Version '${version.displayName}' declares both 'ref' and 'path'. ` +
                                "A git-ref-backed version builds its content from the ref, so 'path' is not used. " +
                                "Remove 'path' to build from the ref, or remove 'ref' to build from the working tree."
                        }
                    ];
                }
                return [];
            }
        };
    }
};
