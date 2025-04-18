// src/config.ts

export type UserRole = 'general_public' | 'farmer' | 'urban_planner';

export interface RoleConfig {
  h3Resolution: number;
  defaultLayers: { [key: string]: boolean };
  displayName: string;
}

export const ROLES_CONFIG: Record<UserRole, RoleConfig> = {
  general_public: {
    h3Resolution: 10, // Moderate detail
    defaultLayers: {
      temperature: true,
      soilMoisture: false,
      fireRiskIndex: false,
      urbanHeatIntensity: false,
    },
    displayName: 'General Public',
  },
  farmer: {
    h3Resolution: 8, // Larger hexes, broader view
    defaultLayers: {
      temperature: false,
      soilMoisture: true, // Focus on soil
      fireRiskIndex: true, // Important for rural areas
      urbanHeatIntensity: false,
    },
    displayName: 'Farmer',
  },
  urban_planner: {
    h3Resolution: 11, // Higher detail for suburbs/city blocks
    defaultLayers: {
      temperature: false,
      soilMoisture: false,
      fireRiskIndex: false,
      urbanHeatIntensity: true, // Key metric for urban planning
    },
    displayName: 'Urban Planner',
  }, 
};

// Default state for logged-out or initial view
export const DEFAULT_CONFIG: RoleConfig = ROLES_CONFIG.general_public; // Or define a unique default
export const INITIAL_H3_RESOLUTION = DEFAULT_CONFIG.h3Resolution;
export const INITIAL_ACTIVE_LAYERS = DEFAULT_CONFIG.defaultLayers;

// Helper function to get config for a role, falling back to default
export const getConfigForRole = (role: UserRole | null): RoleConfig => {
  return role ? ROLES_CONFIG[role] : DEFAULT_CONFIG;
};