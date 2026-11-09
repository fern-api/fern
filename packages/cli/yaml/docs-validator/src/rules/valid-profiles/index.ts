import { Rule, RuleViolation } from "../../Rule.js";

export const ValidProfilesRule: Rule = {
    name: "valid-profiles",
    create: (context) => {
        const declared = new Set(Object.keys(context.workspace.config.profiles ?? {}));
        const check = (content: unknown): RuleViolation[] =>
            [...collectProfileRefs(content)]
                .filter((name) => !declared.has(name))
                .map((name) => ({
                    severity: "fatal",
                    message: `Profile "${name}" is used but not defined in profiles: in docs.yml.`
                }));
        return {
            file: ({ config }) => [
                // fatal so that generation fails: vars that could not be read would leave `${NAME}` unfilled
                ...(config._profileVarsFileErrors ?? []).map(
                    (message): RuleViolation => ({ severity: "fatal", message })
                ),
                ...check({ ...config, profiles: undefined, _profileVarsFileErrors: undefined })
            ],
            productFile: ({ content }) => check(content),
            versionFile: ({ content }) => check(content)
        };
    }
};

function collectProfileRefs(value: unknown, refs: Set<string> = new Set()): Set<string> {
    if (Array.isArray(value)) {
        value.forEach((item) => collectProfileRefs(item, refs));
    } else if (value != null && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
            if (key === "profile" && typeof child === "string") {
                refs.add(child);
            } else {
                collectProfileRefs(child, refs);
            }
        }
    }
    return refs;
}
