
module Seed
    module Types
        class ObjectWithOptionalField < Internal::Types::Model
            field :string, , optional: true, nullable: false
            field :integer, , optional: true, nullable: false
            field :long, , optional: true, nullable: false
            field :double, , optional: true, nullable: false
            field :bool, , optional: true, nullable: false
            field :datetime, , optional: true, nullable: false
            field :date, , optional: true, nullable: false
            field :uuid, , optional: true, nullable: false
            field :base_64, , optional: true, nullable: false
            field :list, , optional: true, nullable: false
            field :set, , optional: true, nullable: false
            field :map, , optional: true, nullable: false
            field :bigint, , optional: true, nullable: false
        end
    end
end
