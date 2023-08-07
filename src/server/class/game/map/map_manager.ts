import GameMap from "./map.js";
import MapSettings from "./map_settings.js";

export default class MapManager {

    public static mapsSettings: Map<GameMap, MapSettings> = new Map<GameMap, MapSettings>([
        [GameMap.DEFAULT, {
            name: "Classic",
            background_url: "https://i.imgur.com/5JZ0K5n.png",
            ball_color: 0x000000,
            players_color: {
                2: [
                    0x000000,
                    0x000000
                ],
                3: [
                    0x000000,
                    0x000000,
                    0x000000
                ],
                4: [
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000
                ],
                5: [
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000
                ],
                6: [
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000
                ],
                7: [
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000
                ],
                8: [
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000,
                    0x000000
                ]
            }
        }],
    ]);

    public static settingsOf(map: GameMap): MapSettings{
        const result = MapManager.mapsSettings.get(map);
        if (!result) throw new Error(`Map ${map} not found`);
        return result;
    }
}