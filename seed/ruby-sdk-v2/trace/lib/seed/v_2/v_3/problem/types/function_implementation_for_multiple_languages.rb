# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class FunctionImplementationForMultipleLanguages < Internal::Types::Model
            field :code_by_language, lambda {
              Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::V3::Problem::Types::FunctionImplementation]
            }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
