/**
 * @example
 *     {
 *         team_member_id: "team_member_id"
 *     }
 */
export interface UpdateTeamMemberRequest {
    team_member_id: string;
    given_name?: string;
    family_name?: string;
    email_address?: string;
}
