import { getBreadcrumbsFromReference } from "../../../schema/utils/getBreadcrumbsFromReference";

describe("it can find the relevant breadcrumbs and exclude openapi keywords", () => {
    test("#/components/schemas/ExampleSchema should return ExampleSchema", () => {
        const reference = "#/components/schemas/ExampleSchema";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["ExampleSchema"]);
    });

    test("#/components/responses/NotFound/content/application~1json/schema should return NotFound", () => {
        const reference = "#/components/responses/NotFound/content/application~1json/schema";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["NotFound"]);
    });

    test("#/components/parameters/accept should return accept", () => {
        const reference = "#/components/parameters/accept";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["accept"]);
    });

    test("#/components/parameters/accept/schema should return accept", () => {
        const reference = "#/components/parameters/accept/schema";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["accept"]);
    });

    test("#/components/parameters/accept/schema/properties/BigFoot should return accept", () => {
        const reference = "#/components/parameters/accept/schema/properties/BigFoot";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["accept", "BigFoot"]);
    });

    test("#/components/schemas/Movie/properties/Actor should return Movie, Actor", () => {
        const reference = "#/components/schemas/Movie/properties/Actor";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Movie", "Actor"]);
    });

    test("#/components/schemas/Schema1/properties/foo/properties/bar/properties/foo/properties/bar/properties/hello should return Schema1, foo, bar, foo, bar, hello", () => {
        const reference =
            "#/components/schemas/Schema1/properties/foo/properties/bar/properties/foo/properties/bar/properties/hello";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema1", "foo", "bar", "foo", "bar", "hello"]);
    });

    // this case can occur if there is a user-defined property called "properties"
    test("#/components/schemas/Schema1/properties/properties/properties/bar should return Schema1, properties, bar", () => {
        const reference =
            "#/components/schemas/Schema1/properties/properties/properties/bar/properties/properties/properties/foo";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema1", "properties", "bar", "properties", "foo"]);
    });

    // this case can occur if the user has multiple nested properties called "properties"
    test("#/components/schemas/Schema1/properties/properties/properties/properties/properties/properties/properties/properties should return Schema1, properties, properties, properties, properties", () => {
        const reference =
            "#/components/schemas/Schema1/properties/properties/properties/properties/properties/properties/properties/properties";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema1", "properties", "properties", "properties", "properties"]);
    });

    test("#/components/schemas/Schema1/properties/FavoriteMovies/items/Movie/properties/Actor should return Schema1, FavoriteMovies, Movie, Actor", () => {
        const reference =
            "#/components/schemas/Schema1/properties/FavoriteMovies/items/properties/Movie/properties/Actor";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema1", "FavoriteMovies", "Movie", "Actor"]);
    });

    // this case can occur if the user has defined an attribute called "items"
    test("#/components/schemas/Schema1/properties/ShoppingList/properties/items/items should return Schema1, ShoppingList, items", () => {
        const reference = "#/components/schemas/Schema1/properties/ShoppingList/properties/items/items";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema1", "ShoppingList", "items"]);
    });

    test("#/components/schemas/Schema1/properties/field1/oneOf", () => {
        const reference = "#/components/schemas/Schema1/properties/field1/oneOf";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema1", "field1"]);
    });

    test("#/components/schemas/ArraySchema/items", () => {
        const reference = "#/components/schemas/ArraySchema/items";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["ArraySchema"]);
    });

    test("#/components/schemas/Schema2/anyOf", () => {
        const reference = "#/components/schemas/Schema2/anyOf";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema2"]);
    });

    test("#/components/schemas/CombinedSchema/allOf", () => {
        const reference = "#/components/schemas/CombinedSchema/allOf";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["CombinedSchema"]);
    });

    test("#/components/schemas/Schema3/properties/field2/oneOf/properties/nestedField", () => {
        const reference = "#/components/schemas/Schema3/properties/field2/oneOf/properties/nestedField";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["Schema3", "field2", "nestedField"]);
    });

    test("#/components/schemas/MatrixSchema/items/items", () => {
        const reference = "#/components/schemas/MatrixSchema/items/items";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["MatrixSchema"]);
    });

    test("#/components/schemas/ObjectSchema/properties/field/anyOf", () => {
        const reference = "#/components/schemas/ObjectSchema/properties/field/anyOf";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["ObjectSchema", "field"]);
    });

    test("#/components/schemas/CombinedSchema/allOf/properties/combinedField", () => {
        const reference = "#/components/schemas/CombinedSchema/allOf/properties/combinedField";
        const breadcrumbs = getBreadcrumbsFromReference(reference);
        expect(breadcrumbs).toEqual(["CombinedSchema", "combinedField"]);
    });
});
