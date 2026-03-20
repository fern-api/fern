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

- **Package:** flatted (npm)
- **Severity:** HIGH
- **Vulnerable versions:** <= 3.4.1
- **Patched version:** 3.4.2
- **CVE:** CVE-2026-33228
- **GHSA:** GHSA-rf6f-7fwh-wjgh
- **Manifest:** pnpm-lock.yaml

**Summary:**
Prototype Pollution via parse() in NodeJS flatted

**Description:**
---
  **Summary**

  The parse() function in flatted can use attacker-controlled string values from the parsed JSON as direct array index
  keys, without validating that they are numeric. Since the internal input buffer is a JavaScript Array, accessing it
  with the key "\_\_proto\_\_" returns Array.prototype via the inherited getter. This object is then treated as a legitimate
   parsed value and assigned as a property of the output object, effectively leaking a live reference to Array.prototype
   to the consumer. Any code that subsequently writes to that property will pollute the global prototype.

  ---
  **Root Cause**

  File: esm/index.js:29 (identical in cjs/index.js)
```
  const resolver = (input, lazy, parsed, $) => output => {
    for (let ke = keys(output), {length} = ke, y = 0; y < length; y++) {
      const k = ke[y];
      const value = output[k];    
      if (value instanceof Primitive) {
        const tmp = input[value];      // Bug is here
```

No validation that value is a safe numeric index input is built as a plain Array. JavaScript's property lookup on arrays traverses the prototype chain for non-numeric  keys. The key "\_\_proto\_\_" resolves to Array.prototype, which:

  - has type "object" → passes the typeof tmp === object guard at line 30
  - is not in the parsed Set yet → passes the !parsed.has(tmp) guard.
  - The reference to Array.prototype is then enqueued in lazy and later unconditionally assigned to the output object.
  ---
  **Replication Steps**
```
  const Flatted = require('flatted'); 
  const parsed = Flatted.parse('[{"x":"__proto__"}]');
  parsed.x.polluted = 'pwned';
  console.log([].polluted);  // Returns true
``` 
 ---
  **Impact**
 An attacker can supply a crafted flatted string to parse() that causes the returned object to hold a live reference to Array.prototype, enabling any downstream code that writes to that property to pollute the global prototype chain, potentially causing denial of service or code execution.

  **Recommended solution**
 Validate that the index string represents an integer within the bounds of input before accessing it:

  // Before (vulnerable)
  const tmp = input[value];

  // After (safe)
  const idx = +value;  // coerce boxed String → number
  const tmp = (Number.isInteger(idx) && idx >= 0 && idx < input.length)
    ? input[idx]
    : undefined;

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/989)
