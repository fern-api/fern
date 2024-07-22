# frozen_string_literal: true

require "date"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Moment
      # @return [String]
      attr_reader :id
      # @return [Date]
      attr_reader :date
      # @return [DateTime]
      attr_reader :datetime
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param date [Date]
      # @param datetime [DateTime]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Moment]
      def initialize(id:, date:, datetime:, additional_properties: nil)
        @id = id
        @date = date
        @datetime = datetime
        @additional_properties = additional_properties
        @_field_set = { "id": id, "date": date, "datetime": datetime }
      end

      # Deserialize a JSON object to an instance of Moment
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Moment]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        date = (Date.parse(parsed_json["date"]) unless parsed_json["date"].nil?)
        datetime = (DateTime.parse(parsed_json["datetime"]) unless parsed_json["datetime"].nil?)
        new(
          id: id,
          date: date,
          datetime: datetime,
          additional_properties: struct
        )
      end

      # Serialize an instance of Moment to a JSON object
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
        obj.date.is_a?(Date) != false || raise("Passed value for field obj.date is not the expected type, validation failed.")
        obj.datetime.is_a?(DateTime) != false || raise("Passed value for field obj.datetime is not the expected type, validation failed.")
      end
    end
  end
end
