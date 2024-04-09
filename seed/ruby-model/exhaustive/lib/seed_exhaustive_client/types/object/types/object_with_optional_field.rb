# frozen_string_literal: true

require "date"
require "set"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Object
      class ObjectWithOptionalField
        attr_reader :string, :integer, :long, :double, :bool, :datetime, :date, :uuid, :base_64, :list, :set, :map,
                    :additional_properties, :_field_set
        protected :_field_set
        OMIT = Object.new
        # @param string [String]
        # @param integer [Integer]
        # @param long [Long]
        # @param double [Float]
        # @param bool [Boolean]
        # @param datetime [DateTime]
        # @param date [Date]
        # @param uuid [String]
        # @param base_64 [String]
        # @param list [Array<String>]
        # @param set [Set<String>]
        # @param map [Hash{Integer => String}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
        def initialize(string: OMIT, integer: OMIT, long: OMIT, double: OMIT, bool: OMIT, datetime: OMIT, date: OMIT,
                       uuid: OMIT, base_64: OMIT, list: OMIT, set: OMIT, map: OMIT, additional_properties: nil)
          # @type [String]
          @string = string if string != OMIT
          # @type [Integer]
          @integer = integer if integer != OMIT
          # @type [Long]
          @long = long if long != OMIT
          # @type [Float]
          @double = double if double != OMIT
          # @type [Boolean]
          @bool = bool if bool != OMIT
          # @type [DateTime]
          @datetime = datetime if datetime != OMIT
          # @type [Date]
          @date = date if date != OMIT
          # @type [String]
          @uuid = uuid if uuid != OMIT
          # @type [String]
          @base_64 = base_64 if base_64 != OMIT
          # @type [Array<String>]
          @list = list if list != OMIT
          # @type [Set<String>]
          @set = set if set != OMIT
          # @type [Hash{Integer => String}]
          @map = map if map != OMIT
          @_field_set = {
            "string": @string,
            "integer": @integer,
            "long": @long,
            "double": @double,
            "bool": @bool,
            "datetime": @datetime,
            "date": @date,
            "uuid": @uuid,
            "base64": @base_64,
            "list": @list,
            "set": @set,
            "map": @map
          }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of ObjectWithOptionalField
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Object::ObjectWithOptionalField]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          string = struct["string"]
          integer = struct["integer"]
          long = struct["long"]
          double = struct["double"]
          bool = struct["bool"]
          datetime = (DateTime.parse(parsed_json["datetime"]) unless parsed_json["datetime"].nil?)
          date = (Date.parse(parsed_json["date"]) unless parsed_json["date"].nil?)
          uuid = struct["uuid"]
          base_64 = struct["base64"]
          list = struct["list"]
          if parsed_json["set"].nil?
            set = nil
          else
            set = parsed_json["set"].to_json
            set = Set.new(set)
          end
          map = struct["map"]
          new(string: string, integer: integer, long: long, double: double, bool: bool, datetime: datetime, date: date,
              uuid: uuid, base_64: base_64, list: list, set: set, map: map, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithOptionalField to a JSON object
        #
        # @return [String]
        def to_json(*_args)
          @_field_set&.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.string&.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
          obj.integer&.is_a?(Integer) != false || raise("Passed value for field obj.integer is not the expected type, validation failed.")
          obj.long&.is_a?(Long) != false || raise("Passed value for field obj.long is not the expected type, validation failed.")
          obj.double&.is_a?(Float) != false || raise("Passed value for field obj.double is not the expected type, validation failed.")
          obj.bool&.is_a?(Boolean) != false || raise("Passed value for field obj.bool is not the expected type, validation failed.")
          obj.datetime&.is_a?(DateTime) != false || raise("Passed value for field obj.datetime is not the expected type, validation failed.")
          obj.date&.is_a?(Date) != false || raise("Passed value for field obj.date is not the expected type, validation failed.")
          obj.uuid&.is_a?(String) != false || raise("Passed value for field obj.uuid is not the expected type, validation failed.")
          obj.base_64&.is_a?(String) != false || raise("Passed value for field obj.base_64 is not the expected type, validation failed.")
          obj.list&.is_a?(Array) != false || raise("Passed value for field obj.list is not the expected type, validation failed.")
          obj.set&.is_a?(Set) != false || raise("Passed value for field obj.set is not the expected type, validation failed.")
          obj.map&.is_a?(Hash) != false || raise("Passed value for field obj.map is not the expected type, validation failed.")
        end
      end
    end
  end
end
