# frozen_string_literal: true

module Seed
  module Foo
    module Types
      class FindRequest < Internal::Types::Model
        field :optional_string, -> { String }, optional: false, nullable: false
        field :public_property, -> { String }, optional: true, nullable: false
        field :private_property, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
