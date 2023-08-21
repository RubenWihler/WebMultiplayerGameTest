/**
 * Represents a package that contains the leaderboard information.
 */
export default interface LeaderboardPackage{
    timout_duration: number;
    leaderboard: Array<{id: number, name: string, place: number}>;
}