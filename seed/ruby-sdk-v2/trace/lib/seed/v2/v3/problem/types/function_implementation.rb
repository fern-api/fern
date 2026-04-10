# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class FunctionImplementation < Internal::Types::Model
            field :impl, -> { String }, optional: false, nullable: false
            field :imports, -> { String }, optional: true, nullable: false
          end
        end
      end
    end
  end
end
