
module Seed
    module Endpoints
        module Params
            class GetWithMultipleQuery
                field :query, String, optional: true, nullable: true
                field :number, Integer, optional: true, nullable: true
            end
        end
    end
end
