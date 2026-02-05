# frozen_string_literal: true

module Seed
  module Service
    module Types
      class JustFileWithOptionalQueryParamsRequest < Internal::Types::Model
        field :maybe_string, -> { String }, optional: true, nullable: false, api_name: "maybeString"
        field :maybe_integer, -> { Integer }, optional: true, nullable: false, api_name: "maybeInteger"
      end
    end
  end
end
