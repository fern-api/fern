# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class GetTokenRequest < Internal::Types::Model
        field :x_api_key, -> { String }, optional: false, nullable: false, api_name: "X-Api-Key"
        field :client_id, -> { String }, optional: false, nullable: false
        field :client_secret, -> { String }, optional: false, nullable: false
        field :audience, -> { String }, optional: false, nullable: false
        field :grant_type, -> { String }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
