// Export all repositories

export { BaseRepository } from './base.repository';
export { ConferencesRepository } from './conferences.repository';
export { SpeakersRepository } from './speakers.repository';
export { ExhibitorsRepository } from './exhibitors.repository';
export { CompanyIntelligenceRepository } from './company-intelligence.repository';
export { BookmarksRepository } from './bookmarks.repository';
export { ProfilesRepository } from './profiles.repository';
export type { Profile, CreateProfileData, UpdateProfileData } from './profiles.repository';

export type {
  PaginationOptions,
  PaginatedResult,
  ConferenceFilters,
  RepositoryError,
  RepositoryResult,
} from './types';

export type { CompanyStats } from './speakers.repository';
export type { TierDistribution } from './exhibitors.repository';

