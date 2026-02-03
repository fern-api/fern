# frozen_string_literal: true

require "date"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object_
      # This type tests that string fields containing datetime-like values
      #  are NOT reformatted by the wire test generator. The string field
      #  should preserve its exact value even if it looks like a datetime.
      class ObjectWithDatetimeLikeString
        # @return [String] A string field that happens to contain a datetime-like value
        attr_reader :datetime_like_string
        # @return [DateTime] An actual datetime field for comparison
        attr_reader :actual_datetime
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param datetime_like_string [String] A string field that happens to contain a datetime-like value
        # @param actual_datetime [DateTime] An actual datetime field for comparison
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithDatetimeLikeString]
        def initialize(datetime_like_string:, actual_datetime:, additional_properties: nil)
          @datetime_like_string = datetime_like_string
          @actual_datetime = actual_datetime
          @additional_properties = additional_properties
          @_field_set = { "datetimeLikeString": datetime_like_string, "actualDatetime": actual_datetime }
        end

        # Deserialize a JSON object to an instance of ObjectWithDatetimeLikeString
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object_::ObjectWithDatetimeLikeString]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          datetime_like_string = parsed_json["datetimeLikeString"]
          actual_datetime = (DateTime.parse(parsed_json["actualDatetime"]) unless parsed_json["actualDatetime"].nil?)
          new(
            datetime_like_string: datetime_like_string,
            actual_datetime: actual_datetime,
            additional_properties: struct
          )
        end

        # Serialize an instance of ObjectWithDatetimeLikeString to a JSON object
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
          obj.datetime_like_string.is_a?(String) != false || raise("Passed value for field obj.datetime_like_string is not the expected type, validation failed.")
          obj.actual_datetime.is_a?(DateTime) != false || raise("Passed value for field obj.actual_datetime is not the expected type, validation failed.")
        end
      end
    end
  end
end
