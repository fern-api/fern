// The Fern setup wizard as a library. The Fern CLI runs it as `fern init` and builds its standalone
// commands (`fern docs brand`, `fern org check`, and so on) from these pieces.

export { detectRepository } from "./detect";
export { type AppliedBrand, applyBrandToDocsSite } from "./docs-site/apply-brand";
export {
    type Availability,
    type ClaimResult,
    createAvailabilityChecker,
    DOCS_DOMAIN,
    isValidName,
    suggestNames
} from "./docs-site/availability";
export {
    type Brand,
    BrandLookupUnauthorizedError,
    type BrandSearchResult,
    downloadBrandFiles,
    fetchBrand,
    readFernToken,
    searchBrands
} from "./docs-site/brand";
export { confidentMatch } from "./docs-site/brand-flow";
export { defaultDocsSiteChoices, LAYOUTS, layoutFromFlag } from "./docs-site/options";
export { scaffoldDocsSite } from "./docs-site/scaffold";
export { getDocsStarter } from "./docs-site/starter";
export { summarizeDetection } from "./splash";
export { runCommandQuietly } from "./steps/commands";
export { writeAgentHandoff } from "./steps/handoff";
export type { Detection, Product, WizardFlags } from "./types";
export { docsSkillCommand, runWizard } from "./wizard";
