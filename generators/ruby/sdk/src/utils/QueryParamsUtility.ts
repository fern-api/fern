import {
    Class_,
    ClassReference,
    Function_,
    GenericClassReference,
    HashReference,
    Import,
    Parameter
} from "@fern-api/ruby-codegen";

export class QueryParamsUtility extends Class_ {
    public flattenQueryParams: Function_;

    constructor(clientName: string) {
        const hashParam = new Parameter({
            name: "hash",
            type: HashReference,
            documentation: "The hash to flatten for query parameters."
        });
        const prefixParam = new Parameter({
            name: "prefix",
            type: GenericClassReference,
            isOptional: true,
            documentation: "The prefix for nested keys (used in recursion)."
        });

        // The flatten_query_params method flattens nested hashes using bracket notation
        // For example: {filter: {name: "john", age: 30}} becomes {"filter[name]" => "john", "filter[age]" => 30}
        // Arrays are kept as-is for exploded format: {tags: ["a", "b"]} stays as {"tags" => ["a", "b"]}
        const flattenQueryParams = new Function_({
            name: "flatten_query_params",
            isStatic: true,
            functionBody: [
                "result = {}",
                "hash.each do |key, value|",
                '  full_key = prefix.nil? ? key.to_s : "#{prefix}[#{key}]"',
                "  if value.is_a?(Hash)",
                "    result.merge!(flatten_query_params(value, full_key))",
                "  elsif value.is_a?(Array)",
                "    value.each do |item|",
                "      if item.is_a?(Hash)",
                "        result.merge!(flatten_query_params(item, full_key)) { |_k, old, new_val| [*old, *new_val].flatten }",
                "      else",
                "        (result[full_key] ||= []) << item",
                "      end",
                "    end",
                "  else",
                "    result[full_key] = value",
                "  end",
                "end",
                "result"
            ],
            parameters: [hashParam, prefixParam],
            returnValue: HashReference
        });

        super({
            classReference: new ClassReference({
                name: "QueryParamsUtils",
                import_: new Import({ from: "core/query_params_utils", isExternal: false }),
                moduleBreadcrumbs: [clientName]
            }),
            includeInitializer: false,
            properties: [],
            documentation: "Utility class for encoding query parameters with deep object support.",
            functions: [flattenQueryParams]
        });

        this.flattenQueryParams = flattenQueryParams;
    }
}
