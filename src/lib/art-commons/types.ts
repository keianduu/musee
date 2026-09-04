export type JapanSearchCommon = {
  id?: string;
  title?: string;
  titleEn?: string;
  thumbnailUrl?: string[];
  contentsUrl?: string[];
  contentsType?: string;
  contentsRightsType?: string;
  contentsAccess?: string;
  location?: string[];
  temporal?: string[];
  linkUrl?: string;
  lastUpdatedDate?: number;
  database?: string;
  provider?: string;
  contributor?: string[];
  coordinates?: { lat?: number; lon?: number };
};

export type ArtCommonsItem = {
  id: string;
  common?: JapanSearchCommon;
  rdfindex?: unknown;
  [key: string]: unknown;
};

export type ArtCommonsSearchResponse = {
  hit: number;
  from: number;
  list: ArtCommonsItem[];
  facets?: unknown;
};

export type ArtCommonsScrollResponse = Omit<ArtCommonsSearchResponse, "from"> & {
  scrollId?: string;
};

export type SearchArtCommonsParams = {
  keyword?: string;
  size?: number;
  from?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type SourceImageCandidate = {
  imageUrl: string;
  thumbnailUrl: string | null;
  provider: string | null;
  contentsRightsType: string | null;
  contentsAccess: string | null;
};

export type NormalizedArtCommonsItem = {
  externalId: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  exhibitionType: string | null;
  officialUrl: string | null;
  sourceUrl: string | null;
  sourceUpdatedAt: string | null;
  sourceImages: SourceImageCandidate[];
  venue: {
    name: string;
    address: string | null;
  };
  occurrence: {
    startDate: string | null;
    endDate: string | null;
    openingHoursText: string | null;
    closedDaysText: string | null;
    ticketUrl: string | null;
  };
};
