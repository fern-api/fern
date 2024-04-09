# frozen_string_literal: true

require "date"
require "set"
require_relative "name"
require "ostruct"
require "json"

module SeedObjectClient
  # Exercises all of the built-in types.
  class Type
    attr_reader :one, :two, :three, :four, :five, :six, :seven, :eight, :nine, :ten, :eleven, :twelve, :thirteen,
                :fourteen, :fifteen, :sixteen, :seventeen, :eighteen, :nineteen, :additional_properties, :_field_set
    protected :_field_set
    OMIT = Object.new
    # @param one [Integer]
    # @param two [Float]
    # @param three [String]
    # @param four [Boolean]
    # @param five [Long]
    # @param six [DateTime]
    # @param seven [Date]
    # @param eight [String]
    # @param nine [String]
    # @param ten [Array<Integer>]
    # @param eleven [Set<Float>]
    # @param twelve [Hash{String => Boolean}]
    # @param thirteen [Long]
    # @param fourteen [Object]
    # @param fifteen [Array<Array<Integer>>]
    # @param sixteen [Array<Hash{String => Integer}>]
    # @param seventeen [Array<String>]
    # @param eighteen [String]
    # @param nineteen [SeedObjectClient::Name]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::Type]
    def initialize(one:, two:, three:, four:, five:, six:, seven:, eight:, nine:, ten:, eleven:, twelve:, fourteen:, fifteen:, sixteen:, seventeen:, eighteen:, nineteen:,
                   thirteen: OMIT, additional_properties: nil)
      # @type [Integer]
      @one = one
      # @type [Float]
      @two = two
      # @type [String]
      @three = three
      # @type [Boolean]
      @four = four
      # @type [Long]
      @five = five
      # @type [DateTime]
      @six = six
      # @type [Date]
      @seven = seven
      # @type [String]
      @eight = eight
      # @type [String]
      @nine = nine
      # @type [Array<Integer>]
      @ten = ten
      # @type [Set<Float>]
      @eleven = eleven
      # @type [Hash{String => Boolean}]
      @twelve = twelve
      # @type [Long]
      @thirteen = thirteen if thirteen != OMIT
      # @type [Object]
      @fourteen = fourteen
      # @type [Array<Array<Integer>>]
      @fifteen = fifteen
      # @type [Array<Hash{String => Integer}>]
      @sixteen = sixteen
      # @type [Array<String>]
      @seventeen = seventeen
      # @type [String]
      @eighteen = eighteen
      # @type [SeedObjectClient::Name]
      @nineteen = nineteen
      @_field_set = {
        "one": @one,
        "two": @two,
        "three": @three,
        "four": @four,
        "five": @five,
        "six": @six,
        "seven": @seven,
        "eight": @eight,
        "nine": @nine,
        "ten": @ten,
        "eleven": @eleven,
        "twelve": @twelve,
        "thirteen": @thirteen,
        "fourteen": @fourteen,
        "fifteen": @fifteen,
        "sixteen": @sixteen,
        "seventeen": @seventeen,
        "eighteen": @eighteen,
        "nineteen": @nineteen
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of Type
    #
    # @param json_object [String]
    # @return [SeedObjectClient::Type]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      one = struct["one"]
      two = struct["two"]
      three = struct["three"]
      four = struct["four"]
      five = struct["five"]
      six = (DateTime.parse(parsed_json["six"]) unless parsed_json["six"].nil?)
      seven = (Date.parse(parsed_json["seven"]) unless parsed_json["seven"].nil?)
      eight = struct["eight"]
      nine = struct["nine"]
      ten = struct["ten"]
      if parsed_json["eleven"].nil?
        eleven = nil
      else
        eleven = parsed_json["eleven"].to_json
        eleven = Set.new(eleven)
      end
      twelve = struct["twelve"]
      thirteen = struct["thirteen"]
      fourteen = struct["fourteen"]
      fifteen = struct["fifteen"]
      sixteen = struct["sixteen"]
      seventeen = struct["seventeen"]
      eighteen = struct["eighteen"]
      if parsed_json["nineteen"].nil?
        nineteen = nil
      else
        nineteen = parsed_json["nineteen"].to_json
        nineteen = SeedObjectClient::Name.from_json(json_object: nineteen)
      end
      new(one: one, two: two, three: three, four: four, five: five, six: six, seven: seven, eight: eight, nine: nine,
          ten: ten, eleven: eleven, twelve: twelve, thirteen: thirteen, fourteen: fourteen, fifteen: fifteen, sixteen: sixteen, seventeen: seventeen, eighteen: eighteen, nineteen: nineteen, additional_properties: struct)
    end

    # Serialize an instance of Type to a JSON object
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
      obj.one.is_a?(Integer) != false || raise("Passed value for field obj.one is not the expected type, validation failed.")
      obj.two.is_a?(Float) != false || raise("Passed value for field obj.two is not the expected type, validation failed.")
      obj.three.is_a?(String) != false || raise("Passed value for field obj.three is not the expected type, validation failed.")
      obj.four.is_a?(Boolean) != false || raise("Passed value for field obj.four is not the expected type, validation failed.")
      obj.five.is_a?(Long) != false || raise("Passed value for field obj.five is not the expected type, validation failed.")
      obj.six.is_a?(DateTime) != false || raise("Passed value for field obj.six is not the expected type, validation failed.")
      obj.seven.is_a?(Date) != false || raise("Passed value for field obj.seven is not the expected type, validation failed.")
      obj.eight.is_a?(String) != false || raise("Passed value for field obj.eight is not the expected type, validation failed.")
      obj.nine.is_a?(String) != false || raise("Passed value for field obj.nine is not the expected type, validation failed.")
      obj.ten.is_a?(Array) != false || raise("Passed value for field obj.ten is not the expected type, validation failed.")
      obj.eleven.is_a?(Set) != false || raise("Passed value for field obj.eleven is not the expected type, validation failed.")
      obj.twelve.is_a?(Hash) != false || raise("Passed value for field obj.twelve is not the expected type, validation failed.")
      obj.thirteen&.is_a?(Long) != false || raise("Passed value for field obj.thirteen is not the expected type, validation failed.")
      obj.fourteen.is_a?(Object) != false || raise("Passed value for field obj.fourteen is not the expected type, validation failed.")
      obj.fifteen.is_a?(Array) != false || raise("Passed value for field obj.fifteen is not the expected type, validation failed.")
      obj.sixteen.is_a?(Array) != false || raise("Passed value for field obj.sixteen is not the expected type, validation failed.")
      obj.seventeen.is_a?(Array) != false || raise("Passed value for field obj.seventeen is not the expected type, validation failed.")
      obj.eighteen.is_a?(String) != false || raise("Passed value for field obj.eighteen is not the expected type, validation failed.")
      SeedObjectClient::Name.validate_raw(obj: obj.nineteen)
    end
  end
end
