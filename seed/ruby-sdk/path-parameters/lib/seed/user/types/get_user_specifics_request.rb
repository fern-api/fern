# frozen_string_literal: true

module Seed
  module User
    module Types
      class GetUserSpecificsRequest < Internal::Types::Model
        field :tenant_id, -> { String }, optional: false, nullable: false
        field :user_id, -> { String }, optional: false, nullable: false
        field :version, -> { Integer }, optional: false, nullable: false
        field :thought, -> { String }, optional: false, nullable: false
      end
    end
  end
end
