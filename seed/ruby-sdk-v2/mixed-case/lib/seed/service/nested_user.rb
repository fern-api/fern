# frozen_string_literal: true

module Seed
    module Types
        class NestedUser < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :nested_user, Seed::Service::User, optional: false, nullable: false
        end
    end
end
