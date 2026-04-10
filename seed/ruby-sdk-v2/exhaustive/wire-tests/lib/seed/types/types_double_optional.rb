# frozen_string_literal: true

module Seed
  module Types
    class TypesDoubleOptional < Internal::Types::Model
      field :optional_alias, -> { String }, optional: true, nullable: false, api_name: "optionalAlias"
    end
  end
end
