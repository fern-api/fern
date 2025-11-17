# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExhaustiveClient
  module Types
    class Docs
      class ObjectWithDocs
        # @return [String] Characters that could lead to broken generated SDKs:
        #  Markdown Escapes:
        #  - \_: Escaped underscore (e.g., FOO\_BAR)
        #  - \*: Escaped asterisk
        #  JSDoc (JavaScript/TypeScript):
        #  - @: Used for JSDoc tags
        #  - {: }: Used for type definitions
        #  - <: >: HTML tags
        #  - *: Can interfere with comment blocks
        #  - /**: JSDoc comment start
        #  - ** /: JSDoc comment end
        #  - &: HTML entities
        #  XMLDoc (C#):
        #  - <: >: XML tags
        #  - &: ': ": <: >: XML special characters
        #  - {: }: Used for interpolated strings
        #  - ///: Comment marker
        #  - /**: Block comment start
        #  - ** /: Block comment end
        #  Javadoc (Java):
        #  - @: Used for Javadoc tags
        #  - <: >: HTML tags
        #  - &: HTML entities
        #  - *: Can interfere with comment blocks
        #  - /**: Javadoc comment start
        #  - ** /: Javadoc comment end
        #  Doxygen (C++):
        #  - \: Used for Doxygen commands
        #  - @: Alternative command prefix
        #  - <: >: XML/HTML tags
        #  - &: HTML entities
        #  - /**: C-style comment start
        #  - ** /: C-style comment end
        #  RDoc (Ruby):
        #  - :: Used in symbol notation
        #  - =: Section markers
        #  - #: Comment marker
        #  - =begin: Block comment start
        #  - =end: Block comment end
        #  - @: Instance variable prefix
        #  - $: Global variable prefix
        #  - %: String literal delimiter
        #  - #{: String interpolation start
        #  - }: String interpolation end
        #  PHPDoc (PHP):
        #  - @: Used for PHPDoc tags
        #  - {: }: Used for type definitions
        #  - $: Variable prefix
        #  - /**: PHPDoc comment start
        #  - ** /: PHPDoc comment end
        #  - *: Can interfere with comment blocks
        #  - &: HTML entities
        attr_reader :string
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param string [String] Characters that could lead to broken generated SDKs:
        #  Markdown Escapes:
        #  - \_: Escaped underscore (e.g., FOO\_BAR)
        #  - \*: Escaped asterisk
        #  JSDoc (JavaScript/TypeScript):
        #  - @: Used for JSDoc tags
        #  - {: }: Used for type definitions
        #  - <: >: HTML tags
        #  - *: Can interfere with comment blocks
        #  - /**: JSDoc comment start
        #  - ** /: JSDoc comment end
        #  - &: HTML entities
        #  XMLDoc (C#):
        #  - <: >: XML tags
        #  - &: ': ": <: >: XML special characters
        #  - {: }: Used for interpolated strings
        #  - ///: Comment marker
        #  - /**: Block comment start
        #  - ** /: Block comment end
        #  Javadoc (Java):
        #  - @: Used for Javadoc tags
        #  - <: >: HTML tags
        #  - &: HTML entities
        #  - *: Can interfere with comment blocks
        #  - /**: Javadoc comment start
        #  - ** /: Javadoc comment end
        #  Doxygen (C++):
        #  - \: Used for Doxygen commands
        #  - @: Alternative command prefix
        #  - <: >: XML/HTML tags
        #  - &: HTML entities
        #  - /**: C-style comment start
        #  - ** /: C-style comment end
        #  RDoc (Ruby):
        #  - :: Used in symbol notation
        #  - =: Section markers
        #  - #: Comment marker
        #  - =begin: Block comment start
        #  - =end: Block comment end
        #  - @: Instance variable prefix
        #  - $: Global variable prefix
        #  - %: String literal delimiter
        #  - #{: String interpolation start
        #  - }: String interpolation end
        #  PHPDoc (PHP):
        #  - @: Used for PHPDoc tags
        #  - {: }: Used for type definitions
        #  - $: Variable prefix
        #  - /**: PHPDoc comment start
        #  - ** /: PHPDoc comment end
        #  - *: Can interfere with comment blocks
        #  - &: HTML entities
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Types::Docs::ObjectWithDocs]
        def initialize(string:, additional_properties: nil)
          @string = string
          @additional_properties = additional_properties
          @_field_set = { "string": string }
        end

        # Deserialize a JSON object to an instance of ObjectWithDocs
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Types::Docs::ObjectWithDocs]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          string = parsed_json["string"]
          new(string: string, additional_properties: struct)
        end

        # Serialize an instance of ObjectWithDocs to a JSON object
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
          obj.string.is_a?(String) != false || raise("Passed value for field obj.string is not the expected type, validation failed.")
        end
      end
    end
  end
end
