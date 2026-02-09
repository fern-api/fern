# frozen_string_literal: true

module Seed
  module Union
    module Types
      class WithName < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
