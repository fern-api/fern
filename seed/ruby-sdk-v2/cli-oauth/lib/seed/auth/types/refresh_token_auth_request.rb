# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class RefreshTokenAuthRequest < Internal::Types::Model
        field :refresh_token, -> { String }, optional: false, nullable: false

        field :grant_type, -> { Seed::Auth::Types::RefreshTokenAuthRequestGrantType }, optional: false, nullable: false
      end
    end
  end
end
