# frozen_string_literal: true

module Seed
  module Types
    class Foo < Internal::Types::Model
      field :bar, -> { String }, optional: true, nullable: false
      field :nullable_bar, -> { String }, optional: true, nullable: false
      field :nullable_required_bar, -> { String }, optional: false, nullable: true
      field :required_bar, -> { String }, optional: false, nullable: false
    end
  end
end
