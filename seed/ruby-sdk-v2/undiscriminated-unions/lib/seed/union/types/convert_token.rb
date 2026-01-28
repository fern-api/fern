# frozen_string_literal: true

module Seed
  module Union
    module Types
      class ConvertToken < Internal::Types::Model
        field :method_, -> { String }, optional: false, nullable: false, api_name: "method"
        field :token_id, -> { String }, optional: false, nullable: false, api_name: "tokenId"
      end
    end
  end
end
