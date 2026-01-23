# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class FunctionImplementationForMultipleLanguages < Internal::Types::Model
            field :code_by_language, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::V3::Problem::Types::FunctionImplementation] }, optional: false, nullable: false, api_name: "codeByLanguage"
          end
        end
      end
    end
  end
end
