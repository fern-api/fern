# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class AuthGetTokenRequest < Internal::Types::Model
        field :client_id, -> { String }, optional: false, nullable: false
        field :client_secret, -> { String }, optional: false, nullable: false
        field :audience, -> { Seed::Auth::Types::AuthGetTokenRequestAudience }, optional: false, nullable: false
        field :grant_type, -> { Seed::Auth::Types::AuthGetTokenRequestGrantType }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
