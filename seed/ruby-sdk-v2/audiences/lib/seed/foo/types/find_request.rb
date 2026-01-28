# frozen_string_literal: true

module Seed
  module Foo
    module Types
      class FindRequest < Internal::Types::Model
        field :optional_string, -> { String }, optional: false, nullable: false, api_name: "optionalString"
        field :public_property, -> { String }, optional: true, nullable: false, api_name: "publicProperty"
        field :private_property, -> { Integer }, optional: true, nullable: false, api_name: "privateProperty"
      end
    end
  end
end
