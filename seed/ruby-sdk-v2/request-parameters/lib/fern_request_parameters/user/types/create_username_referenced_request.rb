# frozen_string_literal: true

module FernRequestParameters
  module User
    module Types
      class CreateUsernameReferencedRequest < Internal::Types::Model
        field :tags, -> { Internal::Types::Array[String] }, optional: false, nullable: false
        field :body, -> { FernRequestParameters::User::Types::CreateUsernameBody }, optional: false, nullable: false
      end
    end
  end
end
