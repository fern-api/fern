# frozen_string_literal: true

require "set"
require "json"

module SeedClient
  module Types
    module Object
      class ObjectWithOptionalField
        attr_reader :string, :integer, :long, :double, :bool, :datetime, :date, :uuid, :base_64, :list, :set, :map,
                    :additional_properties

        # @param string [String]
        # @param integer [Integer]
        # @param long [Long]
        # @param double [Float]
        # @param bool [Boolean]
        # @param datetime [DateTime]
        # @param date [Date]
        # @param uuid [UUID]
        # @param base_64 [String]
        # @param list [Array<String>]
        # @param set [Set<String>]
        # @param map [Hash{Integer => Integer}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Types::Object::ObjectWithOptionalField]
        def initialze(string: nil, integer: nil, long: nil, double: nil, bool: nil, datetime: nil, date: nil,
                      uuid: nil, base_64: nil, list: nil, set: nil, map: nil, additional_properties: nil)
          # @type [String]
          @string = string
          # @type [Integer]
          @integer = integer
          # @type [Long]
          @long = long
          # @type [Float]
          @double = double
          # @type [Boolean]
          @bool = bool
          # @type [DateTime]
          @datetime = datetime
          # @type [Date]
          @date = date
          # @type [UUID]
          @uuid = uuid
          # @type [String]
          @base_64 = base_64
          # @type [Array<String>]
          @list = list
          # @type [Set<String>]
          @set = set
          # @type [Hash{Integer => Integer}]
          @map = map
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of ObjectWithOptionalField
        #
        # @param json_object [JSON]
        # @return [Types::Object::ObjectWithOptionalField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          string = struct.string
          integer = struct.integer
          long = struct.long
          double = struct.double
          bool = struct.bool
          datetime = struct.datetime
          date = struct.date
          uuid = struct.uuid
          base_64 = struct.base64
          list = struct.list
          set = Set.new(struct.set)
          map = struct.map
          new(string: string, integer: integer, long: long, double: double, bool: bool, datetime: datetime, date: date,
              uuid: uuid, base_64: base_64, list: list, set: set, map: map, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithOptionalField to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            string: @string,
            integer: @integer,
            long: @long,
            double: @double,
            bool: @bool,
            datetime: @datetime,
            date: @date,
            uuid: @uuid,
            base64: @base_64,
            list: @list,
            set: @set&.to_a(),
            map: @map
          }.to_json
        end
      end
    end
  end
end
