# frozen_string_literal: true

module Seed
  module Union
    module Types
      class LeafObjectB < Internal::Types::Model
        field :only_in_b, -> { String }, optional: false, nullable: false, api_name: "onlyInB"
      end
    end
  end
end
