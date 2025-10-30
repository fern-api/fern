import { docsYml } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";

export function enrichApiPackageChild({
    child,
    nodeIdToSubpackageId,
    convertApiDefinitionPackageId,
    mergeAndFilterChildren
}: {
    child: FernNavigation.V1.ApiPackageChild;
    nodeIdToSubpackageId: Map<string, string[]>;
    convertApiDefinitionPackageId: (
        subpackageId: string,
        slug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ) => FernNavigation.V1.ApiPackageChild[];
    mergeAndFilterChildren: (
        children: FernNavigation.V1.ApiPackageChild[],
        subpackageChildren: FernNavigation.V1.ApiPackageChild[]
    ) => FernNavigation.V1.ApiPackageChild[];
}): FernNavigation.V1.ApiPackageChild {
    if (child.type === "apiPackage") {
        // expand the subpackage to include children that haven't been visited yet
        const slug = FernNavigation.V1.SlugGenerator.init(child.slug);
        const subpackageIds = nodeIdToSubpackageId.get(child.id) ?? [];
        const subpackageChildren = subpackageIds.flatMap((subpackageId) =>
            convertApiDefinitionPackageId(subpackageId, slug, child.availability)
        );

        // recursively apply enrichment to children
        const enrichedChildren = child.children.map((innerChild) =>
            enrichApiPackageChild({
                child: innerChild,
                nodeIdToSubpackageId,
                convertApiDefinitionPackageId,
                mergeAndFilterChildren
            })
        );

        // combine children with subpackage (tacked on at the end to preserve order)
        const children = mergeAndFilterChildren(enrichedChildren, subpackageChildren);

        return {
            ...child,
            children,
            pointsTo: undefined
        };
    }
    return child;
}
