# frozen_string_literal: true

require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class Organization
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :domain
      # @return [Integer]
      attr_reader :employee_count
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param name [String]
      # @param domain [String]
      # @param employee_count [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::Organization]
      def initialize(id:, name:, domain: OMIT, employee_count: OMIT, additional_properties: nil)
        @id = id
        @name = name
        @domain = domain if domain != OMIT
        @employee_count = employee_count if employee_count != OMIT
        @additional_properties = additional_properties
        @_field_set = { "id": id, "name": name, "domain": domain, "employeeCount": employee_count }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Organization
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::Organization]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        name = parsed_json["name"]
        domain = parsed_json["domain"]
        employee_count = parsed_json["employeeCount"]
        new(
          id: id,
          name: name,
          domain: domain,
          employee_count: employee_count,
          additional_properties: struct
        )
      end

      # Serialize an instance of Organization to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.domain&.is_a?(String) != false || raise("Passed value for field obj.domain is not the expected type, validation failed.")
        obj.employee_count&.is_a?(Integer) != false || raise("Passed value for field obj.employee_count is not the expected type, validation failed.")
      end
    end
  end
end
