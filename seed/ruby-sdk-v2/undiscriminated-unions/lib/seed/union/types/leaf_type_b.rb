# frozen_string_literal: true

module Seed
  module Union
    module Types
      class LeafTypeB < Internal::Types::Model
        field :gamma, -> { String }, optional: false, nullable: false
      end
    end
  end
end
