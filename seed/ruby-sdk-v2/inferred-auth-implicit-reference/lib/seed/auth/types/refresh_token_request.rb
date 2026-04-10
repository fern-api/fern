# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class RefreshTokenRequest < Internal::Types::Model
        field :client_id, -> { String }, optional: false, nullable: false
        field :client_secret, -> { String }, optional: false, nullable: false
        field :refresh_token, -> { String }, optional: false, nullable: false
        field :audience, -> { Seed::Auth::Types::RefreshTokenRequestAudience }, optional: false, nullable: false
        field :grant_type, -> { Seed::Auth::Types::RefreshTokenRequestGrantType }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
