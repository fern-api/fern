# frozen_string_literal: true

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
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Moment
      #
      # @param json_object [JSON] 
      # @return [Types::Moment] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        date = struct.date
        datetime = struct.datetime
        new(id: id, date: date, datetime: datetime, additional_properties: struct)
      end
      # Serialize an instance of Moment to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 id: @id,
 date: @date,
 datetime: @datetime
}.to_json()
      end
    end
  end
end