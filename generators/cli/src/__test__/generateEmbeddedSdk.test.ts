import { describe, expect, it } from "vitest";
import { buildEmbeddedSdkPrelude } from "../generateEmbeddedSdk.js";

/**
 * The embedded SDK crate's prelude must re-export both the co-generated
 * types crate (for single type identity) and `std::collections`. The Rust
 * SDK generator emits `use crate::prelude::*;` in `error.rs` and expects
 * `HashMap`/`HashSet` to resolve through the prelude (error-body fields can
 * be `Vec<HashMap<String, serde_json::Value>>`). Dropping the std re-export
 * makes the generated crate fail to compile with `cannot find type HashMap`.
 */
describe("buildEmbeddedSdkPrelude", () => {
    it("re-exports the types crate for single type identity", () => {
        expect(buildEmbeddedSdkPrelude("my_api_types")).toContain("pub use my_api_types::*;");
    });

    it("re-exports std::collections so error.rs's HashMap fields resolve", () => {
        expect(buildEmbeddedSdkPrelude("my_api_types")).toContain("pub use std::collections::{HashMap, HashSet};");
    });

    it("ends with a trailing newline", () => {
        expect(buildEmbeddedSdkPrelude("my_api_types").endsWith("\n")).toBe(true);
    });
});
