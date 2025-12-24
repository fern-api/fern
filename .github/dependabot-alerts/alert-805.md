@devin-ai-integration Please resolve this Dependabot security alert.

**Instructions:**
1. Analyze the vulnerability and understand its impact
2. Update the affected dependency to a secure version. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
3. Ideally resolve this without using an override - prefer updating the dependency directly
4. If an override is absolutely necessary, document why in the PR description
5. Run tests to ensure the update doesn't break anything
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/dependabot-alerts/alert-*.md) as part of your fix
8. Update the PR title, if needed, to pass CI checks

**Alert Details:**

- **Package:** marshmallow (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 3.0.0rc1, < 3.26.2
- **Patched version:** 3.26.2
- **CVE:** CVE-2025-68480
- **GHSA:** GHSA-428g-f7cq-pgp5
- **Manifest:** seed/python-sdk/exhaustive/extra_dependencies/poetry.lock

**Summary:**
Marshmallow has DoS in Schema.load(many)

**Description:**
### Impact

`Schema.load(data, many=True)` is vulnerable to denial of service attacks. A moderately sized request can consume a disproportionate amount of CPU time.

### Patches

4.1.2, 3.26.2

### Workarounds

```py
# Fail fast
def load_many(schema, data, **kwargs):
    if not isinstance(data, list):
        raise ValidationError(['Invalid input type.'])
    return [schema.load(item, **kwargs) for item in data]
```

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/805)
