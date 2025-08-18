# frozen_string_literal: true

module Seed
    module Types
        class GetFunctionSignatureResponse < Internal::Types::Model
            field :function_by_language, Internal::Types::Hash[Seed::Commons::Language, String], optional: false, nullable: false

    end
end
