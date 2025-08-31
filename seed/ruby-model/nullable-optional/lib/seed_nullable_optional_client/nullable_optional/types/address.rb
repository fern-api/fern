# frozen_string_literal: true

require_relative "nullable_user_id"
require_relative "optional_user_id"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    # Nested object for testing
    class Address
      # @return [String]
      attr_reader :street
      # @return [String]
      attr_reader :city
      # @return [String]
      attr_reader :state
      # @return [String]
      attr_reader :zip_code
      # @return [String]
      attr_reader :country
      # @return [SeedNullableOptionalClient::NullableOptional::NULLABLE_USER_ID]
      attr_reader :building_id
      # @return [SeedNullableOptionalClient::NullableOptional::OPTIONAL_USER_ID]
      attr_reader :tenant_id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param street [String]
      # @param city [String]
      # @param state [String]
      # @param zip_code [String]
      # @param country [String]
      # @param building_id [SeedNullableOptionalClient::NullableOptional::NULLABLE_USER_ID]
      # @param tenant_id [SeedNullableOptionalClient::NullableOptional::OPTIONAL_USER_ID]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      def initialize(street:, zip_code:, building_id:, tenant_id:, city: OMIT, state: OMIT, country: OMIT,
                     additional_properties: nil)
        @street = street
        @city = city if city != OMIT
        @state = state if state != OMIT
        @zip_code = zip_code
        @country = country if country != OMIT
        @building_id = building_id
        @tenant_id = tenant_id
        @additional_properties = additional_properties
        @_field_set = {
          "street": street,
          "city": city,
          "state": state,
          "zipCode": zip_code,
          "country": country,
          "buildingId": building_id,
          "tenantId": tenant_id
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Address
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::Address]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        street = parsed_json["street"]
        city = parsed_json["city"]
        state = parsed_json["state"]
        zip_code = parsed_json["zipCode"]
        country = parsed_json["country"]
        building_id = parsed_json["buildingId"]
        tenant_id = parsed_json["tenantId"]
        new(
          street: street,
          city: city,
          state: state,
          zip_code: zip_code,
          country: country,
          building_id: building_id,
          tenant_id: tenant_id,
          additional_properties: struct
        )
      end

      # Serialize an instance of Address to a JSON object
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
        obj.street.is_a?(String) != false || raise("Passed value for field obj.street is not the expected type, validation failed.")
        obj.city&.is_a?(String) != false || raise("Passed value for field obj.city is not the expected type, validation failed.")
        obj.state&.is_a?(String) != false || raise("Passed value for field obj.state is not the expected type, validation failed.")
        obj.zip_code.is_a?(String) != false || raise("Passed value for field obj.zip_code is not the expected type, validation failed.")
        obj.country&.is_a?(String) != false || raise("Passed value for field obj.country is not the expected type, validation failed.")
        obj.building_id.is_a?(String) != false || raise("Passed value for field obj.building_id is not the expected type, validation failed.")
        obj.tenant_id.is_a?(String) != false || raise("Passed value for field obj.tenant_id is not the expected type, validation failed.")
      end
    end
  end
end
