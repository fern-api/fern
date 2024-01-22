# frozen_string_literal: true
require "json"

module SeedClient
  module Types
    class Moment
      attr_reader :id, :date, :datetime, :additional_properties
      # @param id [UUID] 
      # @param date [Date] 
      # @param datetime [DateTime] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Moment] 
      def initialze(id:, date:, datetime:, additional_properties: nil)
        # @type [UUID] 
        @id = id
        # @type [Date] 
        @date = date
        # @type [DateTime] 
        @datetime = datetime
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Moment
      #
      # @param json_object [JSON] 
      # @return [Types::Moment] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id struct.id
        date struct.date
        datetime struct.datetime
        new(id: id, date: date, datetime: datetime, additional_properties: struct)
      end
      # Serialize an instance of Moment to a JSON object
      #
      # @return [JSON] 
      def to_json
        { id: @id, date: @date, datetime: @datetime }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        obj.id.is_a?(UUID) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.date.is_a?(Date) != false || raise("Passed value for field obj.date is not the expected type, validation failed.")
        obj.datetime.is_a?(DateTime) != false || raise("Passed value for field obj.datetime is not the expected type, validation failed.")
      end
    end
  end
end