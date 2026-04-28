# frozen_string_literal: true

module Seed
  module Types
    class GetFooRequest < Internal::Types::Model
      field :optional_baz, -> { String }, optional: true, nullable: false

      field :optional_nullable_baz, -> { String }, optional: true, nullable: false

      field :required_baz, -> { String }, optional: false, nullable: false

      field :required_nullable_baz, -> { String }, optional: false, nullable: true
    end
  end
end
