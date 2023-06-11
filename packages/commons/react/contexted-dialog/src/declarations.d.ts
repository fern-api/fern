// CSS modules
type CSSModuleClasses = Readonly<Record<string, string>>;

declare module "*.module.scss" {
    const classes: CSSModuleClasses;
    export default classes;
}

// CSS
declare module "*.css" {}
declare module "*.scss" {}

// images
declare module "*.png" {
    const src: string;
    export default { src };
}
declare module "*.jpg" {
    const src: string;
    export default { src };
}
declare module "*.jpeg" {
    const src: string;
    export default { src };
}
declare module "*.gif" {
    const src: string;
    export default { src };
}
declare module "*.svg" {
    const src: string;
    export default { src };
}
declare module "*.ico" {
    const src: string;
    export default { src };
}
