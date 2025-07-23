# frozen_string_literal: true

require "ostruct"
require "json"

module SeedEmptyClientsClient
  module Level1
    class Types
      class Address
        # @return [String]
        attr_reader :line_1
        # @return [String]
        attr_reader :line_2
        # @return [String]
        attr_reader :city
        # @return [String]
        attr_reader :state
        # @return [String]
        attr_reader :zip
        # @return [String]
        attr_reader :country
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param line_1 [String]
        # @param line_2 [String]
        # @param city [String]
        # @param state [String]
        # @param zip [String]
        # @param country [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedEmptyClientsClient::Level1::Types::Address]
        def initialize(line_1:, city:, state:, zip:, country:, line_2: OMIT, additional_properties: nil)
          @line_1 = line_1
          @line_2 = line_2 if line_2 != OMIT
          @city = city
          @state = state
          @zip = zip
          @country = country
          @additional_properties = additional_properties
          @_field_set = {
            "line1": line_1,
            "line2": line_2,
            "city": city,
            "state": state,
            "zip": zip,
            "country": country
          }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of Address
        #
        # @param json_object [String]
        # @return [SeedEmptyClientsClient::Level1::Types::Address]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          line_1 = parsed_json["line1"]
          line_2 = parsed_json["line2"]
          city = parsed_json["city"]
          state = parsed_json["state"]
          zip = parsed_json["zip"]
          country = parsed_json["country"]
          new(
            line_1: line_1,
            line_2: line_2,
            city: city,
            state: state,
            zip: zip,
            country: country,
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
          obj.line_1.is_a?(String) != false || raise("Passed value for field obj.line_1 is not the expected type, validation failed.")
          obj.line_2&.is_a?(String) != false || raise("Passed value for field obj.line_2 is not the expected type, validation failed.")
          obj.city.is_a?(String) != false || raise("Passed value for field obj.city is not the expected type, validation failed.")
          obj.state.is_a?(String) != false || raise("Passed value for field obj.state is not the expected type, validation failed.")
          obj.zip.is_a?(String) != false || raise("Passed value for field obj.zip is not the expected type, validation failed.")
          obj.country.is_a?(String) != false || raise("Passed value for field obj.country is not the expected type, validation failed.")
        end
      end
    end
  end
end
