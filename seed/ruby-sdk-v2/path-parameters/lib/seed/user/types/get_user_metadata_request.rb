# frozen_string_literal: true

module Seed
  module User
    module Types
      class GetUserMetadataRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :user_id, -> { String }, optional: false, nullable: false
        field :version, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
