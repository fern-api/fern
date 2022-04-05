import { PackageName } from "./types";
import { isBundle } from "./utils";

const identity = <T>(val: T) => val;

export function createOverridablePackageValueSupplier<T>({
    defaultValue,
    getValueForBundle,
    overrides,
}: {
    defaultValue: T;
    getValueForBundle?: (defaultValue: T) => T;
    overrides?: Record<PackageName, PackageValueOverride<T> | undefined>;
}): OverridablePackageValueSupplier<T> {
    const supplier = createOverridablePackageValueSupplierWithArgument<undefined, T>({
        getDefaultValue: () => defaultValue,
        getValueForBundle,
        overrides,
    });

    return (packageName) => {
        return supplier(undefined, packageName);
    };
}

export function createOverridablePackageValueSupplierWithArgument<A, T>({
    getDefaultValue,
    getValueForBundle = identity,
    overrides,
}: {
    getDefaultValue: (args: A) => T;
    getValueForBundle?: (defaultValue: T, args: A) => T;
    overrides?: Record<PackageName, PackageValueOverride<T> | undefined>;
}): OverridablePackageValueSupplierWithArgument<A, T> {
    return (args, packageName) => {
        let value = getDefaultValue(args);
        if (isBundle(packageName)) {
            value = getValueForBundle(value, args);
        }
        const override = overrides?.[packageName];
        if (override != null) {
            value = override(value);
        }
        return value;
    };
}

export type OverridablePackageValueSupplier<T> = (packageName: PackageName) => T;

export type PackageValueOverride<T> = (defaultValue: T) => T;

export type OverridablePackageValueSupplierWithArgument<A, T> = (args: A, packageName: PackageName) => T;
