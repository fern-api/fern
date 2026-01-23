# frozen_string_literal: true

module FernInferredAuthImplicitApiKey
  module Auth
    module Types
      class GetTokenRequest < Internal::Types::Model
        field :api_key, -> { String }, optional: false, nullable: false, api_name: "X-Api-Key"
      end
    end
  end
end
