# frozen_string_literal: true

module Seed
  module Service
    module Types
      class JustFileWithQueryParamsRequest < Internal::Types::Model
        field :maybe_string, -> { String }, optional: true, nullable: false, api_name: "maybeString"
        field :integer, -> { Integer }, optional: false, nullable: false
        field :maybe_integer, -> { Integer }, optional: true, nullable: false, api_name: "maybeInteger"
        field :list_of_strings, -> { String }, optional: false, nullable: false, api_name: "listOfStrings"
        field :optional_list_of_strings, lambda {
          String
        }, optional: true, nullable: false, api_name: "optionalListOfStrings"
      end
    end
  end
end
