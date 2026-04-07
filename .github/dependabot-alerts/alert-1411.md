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

- **Package:** vite (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 7.0.0, <= 7.3.1
- **Patched version:** 7.3.2
- **CVE:** N/A
- **GHSA:** GHSA-4w7w-66w2-5vf9
- **Manifest:** pnpm-lock.yaml

**Summary:**
Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling

**Description:**
### Summary

Any files ending with `.map` even out side the project can be returned to the browser.

### Impact

Only apps that match the following conditions are affected:

- explicitly exposes the Vite dev server to the network (using `--host` or [`server.host` config option](https://vitejs.dev/config/server-options.html#server-host))
- have a sensitive content in files ending with `.map` and the path is predictable

### Details

In Vite v7.3.1, the dev server’s handling of `.map` requests for optimized dependencies resolves file paths and calls `readFile` without restricting `../` segments in the URL. As a result, it is possible to bypass the [`server.fs.strict`](https://vite.dev/config/server-options#server-fs-strict) allow list and retrieve `.map` files located outside the project root, provided they can be parsed as valid source map JSON.

### PoC
1. Create a minimal PoC sourcemap outside the project root
    ```bash
    cat > /tmp/poc.map <<'EOF'
    {"version":3,"file":"x.js","sources":[],"names":[],"mappings":""}
    EOF
    ```
2. Start the Vite dev server (example)
    ```bash
    pnpm -C playground/fs-serve dev --host 127.0.0.1 --port 18080
    ```
3. Confirm that direct `/@fs` access is blocked by `strict` (returns 403)
    <img width="4004" height="1038" alt="image" src="https://github.com/user-attachments/assets/15a859a8-1dc6-4105-8d58-80527c0dd9ab" />
4. Inject `../` segments under the optimized deps `.map` URL prefix to reach `/tmp/poc.map`
    <img width="2790" height="846" alt="image" src="https://github.com/user-attachments/assets/5d02957d-2e6a-4c45-9819-3f024e0e81f2" />

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1411)
