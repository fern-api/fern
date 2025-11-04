# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class GetFunctionSignatureResponse < Internal::Types::Model
          field :function_by_language, lambda {
            Internal::Types::Hash[Seed::Commons::Types::Language, String]
          }, optional: false, nullable: false, api_name: "functionByLanguage"
        end
      end
    end
  end
end
