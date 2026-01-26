import {
    Class_,
    ClassReference,
    Expression,
    Function_,
    GenericClassReference,
    HashReference,
    Import,
    Parameter,
    StringClassReference
} from "@fern-api/ruby-codegen";

export class QueryParamsUtility extends Class_ {
    public flattenQueryParams: Function_;

    constructor(clientName: string) {
        const hashParam = new Parameter({
            name: "hash",
            type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
            documentation: "The hash to flatten for query parameters."
        });
        const prefixParam = new Parameter({
            name: "prefix",
            type: GenericClassReference,
            isOptional: true,
            documentation: "The prefix for nested keys (used in recursion)."
        });

        // Helper function to create raw Ruby code lines as Expression nodes
        const rawLine = (code: string): Expression =>
            new Expression({
                rightSide: code,
                isAssignment: false
            });

        // The flatten_query_params method flattens nested hashes using bracket notation
        // For example: {filter: {name: "john", age: 30}} becomes {"filter[name]" => "john", "filter[age]" => 30}
        // Arrays are kept as-is for exploded format: {tags: ["a", "b"]} stays as {"tags" => ["a", "b"]}
        const flattenQueryParams = new Function_({
            name: "flatten_query_params",
            isStatic: true,
            functionBody: [
                rawLine("result = {}"),
                rawLine("hash.each do |key, value|"),
                rawLine('  full_key = prefix.nil? ? key.to_s : "#{prefix}[#{key}]"'),
                rawLine("  if value.is_a?(Hash)"),
                rawLine("    result.merge!(flatten_query_params(value, full_key))"),
                rawLine("  elsif value.is_a?(Array)"),
                rawLine("    value.each do |item|"),
                rawLine("      if item.is_a?(Hash)"),
                rawLine(
                    "        result.merge!(flatten_query_params(item, full_key)) { |_k, old, new_val| [*old, *new_val].flatten }"
                ),
                rawLine("      else"),
                rawLine("        (result[full_key] ||= []) << item"),
                rawLine("      end"),
                rawLine("    end"),
                rawLine("  else"),
                rawLine("    result[full_key] = value"),
                rawLine("  end"),
                rawLine("end"),
                rawLine("result")
            ],
            parameters: [hashParam, prefixParam],
            returnValue: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference })
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
