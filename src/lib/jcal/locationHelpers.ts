// Location Helper Functions
import { Location, Locations } from 'jcal-zmanim';

/**
 * Get a location by name from the built-in locations list
 */
export const getLocationByName = (name: string): Location | undefined => {
    return Locations.find(loc => loc.Name.toLowerCase() === name.toLowerCase());
};

/**
 * Search for locations by partial name
 */
export const searchLocations = (searchTerm: string): Location[] => {
    const term = searchTerm.toLowerCase();
    return Locations.filter(loc => loc.Name.toLowerCase().includes(term));
};

/**
 * Create a custom location
 */
export const createLocation = (
    name: string,
    nameHebrew: string,
    israel: boolean,
    latitude: number,
    longitude: number,
    utcOffset: number,
    elevation = 0
): Location => {
    return new Location(name, nameHebrew, israel, latitude, longitude, utcOffset, elevation);
};

/**
 * Get default location (Jerusalem)
 */
export const getDefaultLocation = (): Location => {
    const jerusalem = getLocationByName('Jerusalem');
    if (jerusalem) {
        return jerusalem;
    }

    // Fallback if Jerusalem not found
    return createLocation('Jerusalem', 'ירושלים', true, 31.7683, 35.2137, 2, 754);
};

/**
 * Get popular locations for quick selection
 */
export const getPopularLocations = (): Location[] => {
    const popularNames = [
        'Jerusalem',
        'Tel Aviv',
        'New York',
        'Los Angeles',
        'London',
        'Paris',
        'Toronto',
        'Montreal',
        'Miami',
        'Chicago',
    ];

    return popularNames
        .map(name => getLocationByName(name))
        .filter((loc): loc is Location => loc !== undefined);
};

/**
 * Format location for display
 */
export const formatLocation = (location: Location): string => {
    return location.Name;
};

/**
 * Get location coordinates as string
 */
export const getLocationCoordinates = (location: Location): string => {
    const lat = location.Latitude.toFixed(4);
    const lng = location.Longitude.toFixed(4);
    return `${lat}, ${lng}`;
};

/**
 * Check if a location is in Israel
 */
export const isInIsrael = (location: Location): boolean => {
    // Check if the location has the israel property set
    if ('israel' in location) {
        return (location as any).israel === true;
    }

    // Fallback: check if location name contains Israel-related keywords
    const israelKeywords = ['israel', 'jerusalem', 'tel aviv', 'haifa', 'bnei brak'];
    return israelKeywords.some(keyword =>
        location.Name.toLowerCase().includes(keyword)
    );
};

/**
 * Get all available locations
 */
export const getAllLocations = (): Location[] => {
    return Locations;
};

/**
 * Sort locations alphabetically
 */
export const sortLocationsAlphabetically = (locations: Location[]): Location[] => {
    return [...locations].sort((a, b) => a.Name.localeCompare(b.Name));
};

/**
 * Group locations by country/region
 * This is a simplified version - you might want to enhance this
 */
export const groupLocationsByRegion = (locations: Location[]): Map<string, Location[]> => {
    const grouped = new Map<string, Location[]>();

    locations.forEach(location => {
        // Simple region detection based on name
        // You might want to add more sophisticated logic
        let region = 'Other';

        if (isInIsrael(location)) {
            region = 'Israel';
        } else if (location.Name.includes('USA') || location.Name.includes('United States')) {
            region = 'United States';
        } else if (location.Name.includes('Canada')) {
            region = 'Canada';
        } else if (location.Name.includes('UK') || location.Name.includes('United Kingdom')) {
            region = 'United Kingdom';
        } else if (location.Name.includes('France')) {
            region = 'France';
        }

        if (!grouped.has(region)) {
            grouped.set(region, []);
        }
        grouped.get(region)!.push(location);
    });

    return grouped;
};
