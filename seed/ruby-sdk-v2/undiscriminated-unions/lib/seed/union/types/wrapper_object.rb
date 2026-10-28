# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class WrapperObject < Internal::Types::Model
        field :inner, -> { Seed::Union::Types::NestedObjectUnion }, optional: false, nullable: false

        field :label, -> { String }, optional: false, nullable: false
      end
    end
  end
end
