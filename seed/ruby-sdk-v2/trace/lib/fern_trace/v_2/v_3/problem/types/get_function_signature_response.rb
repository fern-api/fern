# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class GetFunctionSignatureResponse < Internal::Types::Model
            field :function_by_language, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, String] }, optional: false, nullable: false, api_name: "functionByLanguage"
          end
        end
      end
    end
  end
end
