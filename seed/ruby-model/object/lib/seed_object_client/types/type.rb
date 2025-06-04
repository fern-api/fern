# frozen_string_literal: true

require "date"
require "set"
require_relative "name"
require "ostruct"
require "json"

module SeedObjectClient
  # Exercises all of the built-in types.
  class Type
    # @return [Integer]
    attr_reader :one
    # @return [Float]
    attr_reader :two
    # @return [String]
    attr_reader :three
    # @return [Boolean]
    attr_reader :four
    # @return [Long]
    attr_reader :five
    # @return [DateTime]
    attr_reader :six
    # @return [Date]
    attr_reader :seven
    # @return [String]
    attr_reader :eight
    # @return [String]
    attr_reader :nine
    # @return [Array<Integer>]
    attr_reader :ten
    # @return [Set<Float>]
    attr_reader :eleven
    # @return [Hash{String => Boolean}]
    attr_reader :twelve
    # @return [Long]
    attr_reader :thirteen
    # @return [Object]
    attr_reader :fourteen
    # @return [Array<Array<Integer>>]
    attr_reader :fifteen
    # @return [Array<Hash{String => Integer}>]
    attr_reader :sixteen
    # @return [Array<String>]
    attr_reader :seventeen
    # @return [String]
    attr_reader :eighteen
    # @return [SeedObjectClient::Name]
    attr_reader :nineteen
    # @return [Integer]
    attr_reader :twenty
    # @return [Long]
    attr_reader :twentyone
    # @return [Float]
    attr_reader :twentytwo
    # @return [String]
    attr_reader :twentythree
    # @return [DateTime]
    attr_reader :twentyfour
    # @return [Date]
    attr_reader :twentyfive
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
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
    # @param twenty [Integer]
    # @param twentyone [Long]
    # @param twentytwo [Float]
    # @param twentythree [String]
    # @param twentyfour [DateTime]
    # @param twentyfive [Date]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedObjectClient::Type]
    def initialize(one:, two:, three:, four:, five:, six:, seven:, eight:, nine:, ten:, eleven:, twelve:, fourteen:, fifteen:, sixteen:, seventeen:, eighteen:, nineteen:, twenty:, twentyone:, twentytwo:, twentythree:,
                   thirteen: OMIT, twentyfour: OMIT, twentyfive: OMIT, additional_properties: nil)
      @one = one
      @two = two
      @three = three
      @four = four
      @five = five
      @six = six
      @seven = seven
      @eight = eight
      @nine = nine
      @ten = ten
      @eleven = eleven
      @twelve = twelve
      @thirteen = thirteen if thirteen != OMIT
      @fourteen = fourteen
      @fifteen = fifteen
      @sixteen = sixteen
      @seventeen = seventeen
      @eighteen = eighteen
      @nineteen = nineteen
      @twenty = twenty
      @twentyone = twentyone
      @twentytwo = twentytwo
      @twentythree = twentythree
      @twentyfour = twentyfour if twentyfour != OMIT
      @twentyfive = twentyfive if twentyfive != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "one": one,
        "two": two,
        "three": three,
        "four": four,
        "five": five,
        "six": six,
        "seven": seven,
        "eight": eight,
        "nine": nine,
        "ten": ten,
        "eleven": eleven,
        "twelve": twelve,
        "thirteen": thirteen,
        "fourteen": fourteen,
        "fifteen": fifteen,
        "sixteen": sixteen,
        "seventeen": seventeen,
        "eighteen": eighteen,
        "nineteen": nineteen,
        "twenty": twenty,
        "twentyone": twentyone,
        "twentytwo": twentytwo,
        "twentythree": twentythree,
        "twentyfour": twentyfour,
        "twentyfive": twentyfive
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
      one = parsed_json["one"]
      two = parsed_json["two"]
      three = parsed_json["three"]
      four = parsed_json["four"]
      five = parsed_json["five"]
      six = (DateTime.parse(parsed_json["six"]) unless parsed_json["six"].nil?)
      seven = (Date.parse(parsed_json["seven"]) unless parsed_json["seven"].nil?)
      eight = parsed_json["eight"]
      nine = parsed_json["nine"]
      ten = parsed_json["ten"]
      if parsed_json["eleven"].nil?
        eleven = nil
      else
        eleven = parsed_json["eleven"].to_json
        eleven = Set.new(eleven)
      end
      twelve = parsed_json["twelve"]
      thirteen = parsed_json["thirteen"]
      fourteen = parsed_json["fourteen"]
      fifteen = parsed_json["fifteen"]
      sixteen = parsed_json["sixteen"]
      seventeen = parsed_json["seventeen"]
      eighteen = parsed_json["eighteen"]
      if parsed_json["nineteen"].nil?
        nineteen = nil
      else
        nineteen = parsed_json["nineteen"].to_json
        nineteen = SeedObjectClient::Name.from_json(json_object: nineteen)
      end
      twenty = parsed_json["twenty"]
      twentyone = parsed_json["twentyone"]
      twentytwo = parsed_json["twentytwo"]
      twentythree = parsed_json["twentythree"]
      twentyfour = (DateTime.parse(parsed_json["twentyfour"]) unless parsed_json["twentyfour"].nil?)
      twentyfive = (Date.parse(parsed_json["twentyfive"]) unless parsed_json["twentyfive"].nil?)
      new(
        one: one,
        two: two,
        three: three,
        four: four,
        five: five,
        six: six,
        seven: seven,
        eight: eight,
        nine: nine,
        ten: ten,
        eleven: eleven,
        twelve: twelve,
        thirteen: thirteen,
        fourteen: fourteen,
        fifteen: fifteen,
        sixteen: sixteen,
        seventeen: seventeen,
        eighteen: eighteen,
        nineteen: nineteen,
        twenty: twenty,
        twentyone: twentyone,
        twentytwo: twentytwo,
        twentythree: twentythree,
        twentyfour: twentyfour,
        twentyfive: twentyfive,
        additional_properties: struct
      )
    end

    # Serialize an instance of Type to a JSON object
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
      obj.twenty.is_a?(Integer) != false || raise("Passed value for field obj.twenty is not the expected type, validation failed.")
      obj.twentyone.is_a?(Long) != false || raise("Passed value for field obj.twentyone is not the expected type, validation failed.")
      obj.twentytwo.is_a?(Float) != false || raise("Passed value for field obj.twentytwo is not the expected type, validation failed.")
      obj.twentythree.is_a?(String) != false || raise("Passed value for field obj.twentythree is not the expected type, validation failed.")
      obj.twentyfour&.is_a?(DateTime) != false || raise("Passed value for field obj.twentyfour is not the expected type, validation failed.")
      obj.twentyfive&.is_a?(Date) != false || raise("Passed value for field obj.twentyfive is not the expected type, validation failed.")
    end
  end
end
